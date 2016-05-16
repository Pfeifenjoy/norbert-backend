/*
 * @author: Philipp Pütz
 */
import config from '../utils/configuration.js';
import {
	ObjectID
} from 'mongodb';
import {
	createComponent
} from './../core/component';
import {
	Information
} from './../core/information';
import {
	File
} from './../core/file';
import {
	forEachAsyncPooled
} from '../utils/foreach-async';

var https = require('https');
var querystring = require('querystring');
var fs = require('fs');

// Static URLs which are needed for API Calls
const rpcURL = "api.dropboxapi.com";

// Path of the dropbox cursor. The cursor represents the local state of indexed dropbox files.
const cursorFilepath = './files/dropbox/cursor.txt';

let token = ""; // OAuth token
let path_prefix = ""; // Path where norbert searches for new information
let cursor = ""; // Dropbox cursor
let reset = false; // If true dropbox indicates that there are a lot of changes and we have to delete our database

let infoManager; // reference for db operations

// Gets called from the core
var sync = function(infManager) {
	console.log(" - Dropbox Crawler -");

	// Save infoManager in the package scope
	infoManager = infManager;

	// Get needed data from config	
	return initCrawler().then(() => {

		console.log("Dropbox Crawler: Getting needed data from server!");

		// Get changes from Server
		return getData().then(data => {
				if (reset) {
					// Clear all information from dropbox in database! 
					console.log("Dropbox Crawler: Clearing database...");
					return infoManager.remove({}).then(() => {
						// Process received data
						return processEntries(data).then(() => {
							console.log("Dropbox Crawler: Done with processing data");

							// Save cursor, for deployment use async file write => Not used for development because under windows
							// it causes sometimes a "empty" cursor.txt (npm bug)
							/*fs.writeFile(cursorFilepath, cursor, err => {
								if (err) {
									return console.log(err);
								}
							});*/
							fs.writeFileSync(cursorFilepath, cursor);
						});
					});
				} else {
					// Process received data
					return processEntries(data).then(() => {
						console.log("Dropbox Crawler: Done with processing data");

						// Save cursor, for deployment use async file write => Not used for development because under windows
						// it causes sometimes a "empty" cursor.txt (npm bug)
						/*fs.writeFile(cursorFilepath, cursor, err => {
							if (err) {
								return console.log(err);
							}
						});*/
						fs.writeFileSync(cursorFilepath, cursor);
					});
				}

			})
			.catch(err => {
				console.log(err);
			});
	}).catch(err => {
		console.log(err);
	});
}

module.exports = {
	"pluginName": "info-provider-dropbox",
	"pluginObject": {
		"sync": sync
	}
};

/* processEntries
 *
 * [data] is a list of all http-responses
 * Takes the raw http-response and extracts all new entries.
 * After that all new entries will be processed.
 */
let processEntries = (data) => {
	// Get all entries from response
	let arrayEntries = [];
	data.forEach(d => {
		// extract the entries from every http-response
		arrayEntries.push(d.entries);
	});

	// If there are entries -> proxess them
	if (arrayEntries.length > 0) {
		// Concat all entries
		let allEntries = arrayEntries.reduce((previousValue, currentValue) => {
			return previousValue.concat(currentValue);
		});

		console.log("Dropbox Crawler: Processing received data... (this may take some time on first startup!)");

		// Create a synchronised asynchronos pool of promises.
		// The function will take all promises an will execute x (here 100) promises at the same time.
		// If one promise is done the next promise will be taken.
		// The special thing about this function is, if one promise fails the whole process will not stop!
		return forEachAsyncPooled(allEntries, 100, evaluateEntry).then((data) => {
			console.log("Dropbox Crawler: Crawler Errors " + data[1].length);
			if (data[1].length > 0) {
				console.log("Dropbox Crawler: Retrying failed Crawler entries");

				let failedEntries = [];

				data[1].forEach(entry => {
					failedEntries.push(entry.entry);
				});

				return forEachAsyncPooled(failedEntries, 10, evaluateEntry).then(data => {
					if (data[1].length > 0) {
						console.log("Dropbox Crawler: Procssing " + data[1].length + " entries failed again");
						console.log("Dropbox Crawler: Please check you internet connection and check if dropbox server status is ok!");
					} else {
						console.log("Dropbox Crawler: Could process all previous failed entries!");
					}
				});
			}
		});
	}

	return Promise.resolve();
}

/* initCrawler
 *
 * Reads the config and checks if everything this package needs is available.
 */
let initCrawler = () => {

	token = config.get('dropbox.oAuthToken');
	path_prefix = config.get('dropbox.informationPath');

	if (token === undefined || path_prefix === undefined) {
		throw "There is an error in the config file: Settings dropbox.oAuthToken and dropbox.informationPath are required!";
	}

	// Get cursor from cursor file
	// Check if file exists
	return new Promise((resolve, reject) => {
		fs.stat(cursorFilepath, (err, stat) => {
			if (err == null) {
				// File exists already so read it.
				fs.readFile(cursorFilepath, 'utf8', (err, data) => {
					if (err) {
						return console.log(err);
					}
					cursor = data;
					resolve();
				});
			} else if (err.code == 'ENOENT') {
				// File doesn't exists so create it with an empty cursor
				cursor = "";
				fs.writeFile(cursorFilepath, cursor, err => {
					if (err) {
						return console.log(err);
					}
					resolve();
				});
			} else {
				// Some error occured
				reject(err.code);
			}
		});
	});
}

/* getData
 *
 * Gets new data/entries from dropbox server. 
 */
let getData = () => {
	// Call the api call
	return delta().then(data => {

			// Save cursor for next calls
			cursor = data.cursor;

			// Check if reset option is set
			if (data.reset) {
				// If so save it!
				reset = data.reset;
			}

			// If there are more changes -> get them!
			if (data.has_more) {
				return getData()
					.then(extra => {
						// Concat all json responses to a list
						return [data].concat(extra);
					});
			}
			// Return final list
			return [data];

		})
		.catch(error => {
			console.log(error);
		});
}

/* evaluateEntry
 *
 * Evaluates a single entry and extracts all important information.
 */
let evaluateEntry = (entry) => {
	// Promise for synchronisation
	var prom = Promise.resolve();

	// check if [<path>, metadata != null]
	if (!(entry[1] === null)) {
		// Directories are umimportant for us.
		if (entry[1]["is_dir"] === false) {

			// Get id of the file if its an interesting file
			// Revision independent dropbox IDs where indroduced in dropbox APIv2
			// Because we need the delta function (webhooks are the alternative but they require a webhook service and a
			// unique webhook URL for every norbert instance => this is not a option) we have to ask the ID for every file.
			prom = getID(entry[1].rev, entry).then(responseID => {

				// Extract ID
				let id = responseID.substring(responseID.lastIndexOf(":") + 1);

				let filter = {
					"extra.id": id
				};

				return getLink(id, entry).then(link => {

					let trimmedLink = link.replace('https://www.', '');

					// Object with some important information
					let fileObject = {
						"id": id, // unique id for the file
						"rev": entry[1].rev, // unique revision id for the current file => changes if the file content change
						"path": entry[1].path, // stored path
						"link": trimmedLink // shared link for the file
					}

					// Extract filename
					let filename = entry[1].path.substring(entry[1].path.lastIndexOf("/") + 1);

					// Create new file
					let myFile = new File();
					// set location of the file
					myFile.setToRemoteFile(fileObject, filename);

					// Create new document component
					let docu = createComponent('components-document');
					// set file to document
					docu.file = myFile;

					// Compare if id exists in DB
					return infoManager.findOne(filter).then(data => {
						// if ID exists in DB
						let storedInformation = new Information(data);

						if (storedInformation.title != filename || storedInformation.extra != fileObject) {
							// Something changed so update everything
							storedInformation.title = filename;
							storedInformation.extra = fileObject;
							storedInformation.components = [
								docu
							];

							// Update current DB status for the file
							return infoManager.update(storedInformation);
						}

						return Promise.resolve();


					}).catch(err => {
						// Else create new Entry			
						let info = new Information();
						info.title = filename;
						info.extra = fileObject;
						info.components = [
							docu
						];

						// Insert the Information into the database.
						return infoManager.insert(info);
					});
				});
			});
		}
	}
	// metadata is null
	else {
		// Delete all entries with that path and sub path
		let filter = {
			"extra.path": {
				$regex: RegExp("^" + entry[0]),
				$options: "im"
			}
		};

		prom = infoManager.remove(filter);
	}
	return prom;
}

// Dropbox APIv2 
/* getID
 * needs: [rev]: revision of the file
 * 		  [entry]: the actual entry (to estimate after all promises which promise failed)
 * returns revision independent id ("id:xxxxxx")
 */
let getID = (rev, entry) => {

	const pathURL = "/2/files/get_metadata";

	// HTTP-response body
	var body = JSON.stringify({
		"path": "rev:" + rev
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: rpcURL,
		path: pathURL,
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/json'
		}
	};
	return new Promise((resolve, reject) => {

		// Set up the request
		var req = https.request(post_options, (res) => {
			res.setEncoding('utf8');

			let response = "";

			res.on('data', (chunk) => {
				// Add the data chunks
				response += chunk;
			});

			res.on('end', () => {

				if (res.statusCode === 200) {
					// retun id
					resolve(JSON.parse(response).id);
				} else {
					reject({
						entry: entry,
						error: response
					});
				}

			});

		});

		req.on('error', (e) => {
			reject({
				entry: entry,
				error: e
			});
		});

		// Fire the http-request
		req.end(body);
	});
}


// Dropbox APIv1 (Core API)

/* delta
 * needs: token, cursor, path_prefix
 * returns files/folders in the Dropbox or in a given subdirectory, a cursor to process later on, after first /delta request
 * the actual cursor must be given every next /delta call and the path_prefix must be the same!
 */
let delta = () => {

	const pathURL = "/1/delta";

	// HTTP Body options
	var body = querystring.stringify({
		cursor: cursor,
		path_prefix: path_prefix
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: rpcURL,
		path: pathURL,
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	return new Promise((resolve, reject) => {

		// Set up the request
		var req = https.request(post_options, (res) => {
			res.setEncoding('utf8');

			let response = "";

			res.on('data', (chunk) => {
				// Add the data chunks
				response += chunk;
			});

			res.on('end', () => {
				if (res.statusCode === 200) {
					// return json object with data
					resolve(JSON.parse(response));
				} else {
					// retun json object with the error message
					reject(response);
				}

			});

		});
		req.on('error', (err) => {
			// Something really went wrong, e.g no internet connection...
			reject("HTTP-error:" + err);
		});

		// Fire the http-request
		req.end(body);
	});
}

/* getLink
 * needs: [id]: Dropbox ID
 *	      [entry]: the actual entry (to estimate after all promises which promise failed)
 * returns a link for the given file
 */
let getLink = (id, entry) => {
	// Check if there are existings links (maybe user has manually generated a link)
	// Dropbox just accepts one shared link per file for non paying users!
	return getSharedLink(id, entry).then(links => {
		if (links.length > 0) {
			// If there are links return the first one
			return links[0]["url"];
		} else {
			// If there are no links create one
			return createSharedLink(id, entry).then(link => {
				// return the created link
				return link;
			});
		}
	});
}

/* getSharedLink
 * needs: [id]: Dropbox ID
 *	      [entry]: the actual entry (to estimate after all promises which promise failed)
 * returns shared links for a file if there are existing some links
 */
let getSharedLink = (id, entry) => {

	const pathURL = "/2/sharing/list_shared_links";

	// HTTP-response body
	var body = JSON.stringify({
		"path": "id:" + id,
		"direct_only": true
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: rpcURL,
		path: pathURL,
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/json'
		}
	};
	return new Promise((resolve, reject) => {

		// Set up the request
		var req = https.request(post_options, (res) => {
			res.setEncoding('utf8');

			let response = "";

			res.on('data', (chunk) => {
				// Add the data chunks
				response += chunk;
			});

			res.on('end', () => {

				if (res.statusCode === 200) {
					// return links
					resolve(JSON.parse(response)["links"]);
				} else {
					reject({
						entry: entry,
						error: response
					});
				}

			});

		});

		req.on('error', (e) => {
			reject({
				entry: entry,
				error: e
			});
		});

		// Fire the http-request
		req.end(body);
	});
}

/* createSharedLink
 * needs: [id]: Dropbox ID
 *        [entry]: the actual entry (to estimate after all promises which promise failed)
 * returns a shared links for a file
 */
let createSharedLink = (id, entry) => {

	const pathURL = "/2/sharing/create_shared_link_with_settings";

	// HTTP-response body
	var body = JSON.stringify({
		"path": "id:" + id,
		"settings": {}
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: rpcURL,
		path: pathURL,
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/json'
		}
	};
	return new Promise((resolve, reject) => {

		// Set up the request
		var req = https.request(post_options, (res) => {
			res.setEncoding('utf8');

			let response = "";

			res.on('data', (chunk) => {
				// Add the data chunks
				response += chunk;
			});

			res.on('end', () => {

				if (res.statusCode === 200) {
					// return link
					resolve(JSON.parse(response)["url"]);
				} else {
					reject({
						entry: entry,
						error: response
					});
				}

			});

		});

		req.on('error', (e) => {
			reject({
				entry: entry,
				error: e
			});
		});

		// Fire the http-request
		req.end(body);
	});
}