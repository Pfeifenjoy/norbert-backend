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

var https = require('https');
var querystring = require('querystring');
var fs = require('fs');

const rpcURL = "api.dropboxapi.com";
const cursorFilepath = './files/dropbox/cursor.txt';

let token = "";
let path_prefix = "";

let cursor = "";
let reset = false;

let infoManager;

// Gets called from the core
var sync = function(infManager) {
	console.log(" - Dropbox Crawler -");

	// Save infoManager gloabal in the package scope
	infoManager = infManager;

	// Get needed data from config	
	return initCrawler().then(() => {

		console.log("Dropbox Crawler: Getting needed data from server!");

		// Get changes from Server
		return getData().then(data => {
				// Save cursor
				/*fs.writeFile(cursorFilepath, cursor, err => {
					if (err) {
						return console.log(err);
					}
				});*/
				fs.writeFileSync(cursorFilepath, cursor);

				if (reset) {
					// Clear all information from dropbox in database!
					console.log("Dropbox Crawler: Clearing database...");
					return infoManager.remove({}).then(() => {
						// Process received data
						return processEntries(data).then(() => {
							console.log("Dropbox Crawler: Done with processing data");
						});
					});
				} else {
					// Process received data
					return processEntries(data).then(() => {
						console.log("Dropbox Crawler: Done with processing data");
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

let processEntries = (data) => {
	// Get all entries from response
	let arrayEntries = [];
	data.forEach(d => {
		arrayEntries.push(d.entries);
	});

	if (arrayEntries.length > 0) {
		// Concat all entries
		let allEntries = arrayEntries.reduce((previousValue, currentValue) => {
			return previousValue.concat(currentValue);
		});

		console.log("Dropbox Crawler: Processing received data... (this may take some time on first startup!)");


		/*
		let calls = [];

		allEntries.forEach((item) => {
			calls.push(evaluateEntry.bind(null, item));
		});

		let counter = 0;
		let errorcounter = 0;

		function call() {

			if (calls.length > 0) {
				return calls.pop()().then(() => {
					counter++;
					return call();
				}).catch(e => {
					console.log(e);
					errorcounter++;
					return call();
				});
			}

		}

		let allCalls = []

		for (let i = 0; i < 100; ++i) {
			allCalls.push(call());
		}

		return Promise.all(allCalls).then(() => {
			console.log("Total: " + calls.length);
			console.log("Error: " + errorcounter);
			console.log("passed" + counter)
		});
		*/

		/*let progressIntervall = Math.ceil(allEntries.length * 0.1);
		let percentage = 0;

		allEntries.forEach((item, index) => {
			sync = sync.then(() => {
				return evaluateEntry(item).then(() => {
					if ((index + 1) % progressIntervall === 0) {
						percentage += 10;
						console.log("Dropbox Crawler: " + percentage + "% done...")
					}
				});
			});
		});
		*/
	}
	return Promise.resolve();
}

let initCrawler = () => {

	token = config.get('dropbox.oAuthToken');
	path_prefix = config.get('dropbox.informationPath');

	if (token === undefined || path_prefix === undefined) {
		throw "There is an error in the config file: Setting dropbox.oAuthToken, dropbox.informationPath is required!";
	}

	// Get cursor from cursor file
	// Check if file exists
	return new Promise((resolve, reject) => {
		fs.stat(cursorFilepath, (err, stat) => {
			if (err == null) {
				fs.readFile(cursorFilepath, 'utf8', (err, data) => {
					if (err) {
						return console.log(err);
					}
					cursor = data;
					resolve();
				});

			} else if (err.code == 'ENOENT') {
				cursor = "";
				fs.writeFile(cursorFilepath, cursor, err => {
					if (err) {
						return console.log(err);
					}
					resolve();
				});
			} else {
				reject(err.code);
			}
		});
	});
}

let getData = () => {
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

let evaluateEntry = (entry) => {
	var prom = Promise.resolve();
	// check if [<path>, metadata != null]
	if (!(entry[1] === null)) {

		if (entry[1]["is_dir"] === false) {

			// Get id of the file if its an interesting file
			prom = getID(entry[1].rev).then(responseID => {

					// Extract id
					let id = responseID.substring(responseID.lastIndexOf(":") + 1);

					let filter = {
						"extra.id": id
					};

					// Object with some important information
					let fileObject = {
						"id": id, // unique id for the file
						"rev": entry[1].rev, // unique revision id for the current file => changes if the file content change
						"path": entry[1].path, // stored path
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
					infoManager.findOne(filter).then(data => {
						// if ID exists in DB
						let storedInformation = new Information(data);

						if (storedInformation.title != filename || storedInformation.extra != fileObject) {
							// Something changed so upadate it
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

				})
				.catch(error => {
					console.log(error);
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
 * needs: revision of the file
 * returns revision independent id ("id:xxxxxx")
 */
let getID = (rev) => {

	if (Math.random() < 0.1) {
		throw new Error("Random Error");
	}

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
					reject(JSON.parse(response));
				}

			});

		});

		req.on('error', (e) => {
			reject("HTTP-error:" + e);
		});

		// Fire the http-request
		req.end(body);
	});
}


// Dropbox APIv1 (Core API)

/* delta
 * needs: token, cursor, path_prefix
 * returns files/folders in the Dropbox or in a given subdirectory, a cursor to process later on, after first /delta request
 * the actual cursor must be given every next /delta call and the path_prefix must be the same!!
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
					reject(JSON.parse(response));
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