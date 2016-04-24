/*
 * @author: Philipp Pütz
 */
import config from '../utils/configuration.js';
import {
	ObjectID
} from 'mongodb';
import {
	createComponent
} from './../core/components';
import {
	Information
} from './../core/information';
import {
	File
} from './../core/files';

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

var sync = function(infManager) {
	console.log("Dropbox here!");

	infoManager = infManager;

	// Get needed data from config	
	return initCrawler().then(() => {
		// Get changes from Server
		return getData().then(data => {
				// Save cursor
				fs.writeFile(cursorFilepath, cursor, err => {
					if (err) {
						return console.log(err);
					}
				});

				if (reset) {
					// Clear all information from dropbox in database!
					console.log("Clearing databse");
					//return infoManager.remove().then(() => {
						// Process received data
						return processEntries(data);
					//});
				} else {
					// Process received data
					return processEntries(data);
				}

			})
			.catch(err => {
				console.log(err);
			});
	}).catch(err => {
		console.log(err);
	});

	//return infoManager.insert({
	//	"title": "Hallo Welt!"
	//});
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

	let sync = Promise.resolve();

	if (arrayEntries.length > 0) {
		// Concat all entries
		let allEntries = arrayEntries.reduce((previousValue, currentValue) => {
			return previousValue.concat(currentValue);
		});

		allEntries.forEach((item) => {
			sync = sync.then(() => {
				return evaluateEntry(item);
			});
		});
	}

	return sync;
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

	console.log("Evaluating entry!");

	var prom = Promise.resolve();
	// check if [<path>, metadata != null]
	if (!(entry[1] === null)) {

		if (entry[1]["is_dir"] === false) {

			// Get id of the file if its an interesting file
			prom = getID(entry[1].rev).then(responseID => {

					let extractIDArray = responseID.split(':');
					let id = extractIDArray[extractIDArray.length - 1];

					// Compare if id exists in DB
					//infoManager.findOne();

					// findOne(filter.extra(id))
					//cursor -> Information Objekt

					// if ID exists in DB
					// Update current DB status for the file
					// update filter;

					// Else create new Entry
					// Create a description component and fill it with some text.

					let fileObject = {
						"id": id,
						"rev": entry[1].rev,
						"path": entry[1].path,
						"mime_type": entry[1]["mime_type"]
					}

					let extractFilenameArray = entry[1].path.split('/');
					let filename = extractFilenameArray[extractFilenameArray.length - 1];

					let myFile = new File();
					myFile.setToRemoteFile(fileObject, filename);

					let docu = createComponent('components-document');
					docu.file = myFile;

					// Add it to a new Information
					let info = new Information();
					info.title = filename;
					info.components = [
						docu
					];

					// Insert the Information into the database.
					return infoManager.insert(info);

				})
				.catch(error => {
					console.log(error);
				});
		}
	}
	// metadata is null
	else {

		// Delete all entries with that path and sub path
		//delete

	}
	return prom;
}

// Dropbox APIv2 
/* getID
 * needs: revision of the file
 * returns revision independent id ("id:xxxxxx")
 */
let getID = (rev) => {
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

	console.log("Delta: " + cursor);

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