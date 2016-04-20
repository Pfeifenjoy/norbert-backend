/*
 * @author: Philipp Pütz
 */

import config from '../utils/configuration.js';

var https = require('https');
var querystring = require('querystring');
var fs = require('fs');

const rpcURL = "api.dropboxapi.com";

let token = "";
let path_prefix = "";
let cursor = "";
let reset = false;

var sync = function(infoManager) {
	console.log("Dropbox here!");

	initCrawler();

	return getData().then(data => {
			console.log("Finsihed");
			data.forEach(chunk =>{
				console.log(chunk.cursor)
			})
		})
		.catch(err => {
			console.log(err);
		})


	//return infoManager.insert({
	//	"title": "Hallo Welt!"
	//});
}

module.exports = {
	"pluginName": "info-provider-dropbox",
	"sync": sync
};


let initCrawler = () => {

	token = config.get('dropbox.oAuthToken');
	path_prefix = config.get('dropbox.informationPath');
	cursor = config.get('dropbox.cursor');

	if (token === undefined || path_prefix === undefined) {
		throw "There is an error in the config file: Setting dropbox.oAuthToken, dropbox.informationPath is required!";
	}

	if (cursor === undefined) {
		config.set('dropbox.cursor', '');
	}
}

let getData = () => {
	return delta().then(data => {
			cursor = data.cursor;
			reset = data.reset;

			console.log(cursor);
			console.log(data.has_more);
			console.log(reset);

			console.log("Got all Data");


			fs.appendFile("response.txt", JSON.stringify(data), function(err) {
				if (err) {
					return console.log(err);
				}

			});

			if (data.has_more) {
				return getData()
					.then(extra => {
						return [data].concat(extra);
					});
			}
			return [data];

		})
		.catch(error => {
			console.log(error);
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

			let data = "";

			res.on('data', (chunk) => {
				// Add the data chunks
				data += chunk;
			});

			res.on('end', () => {
				if (res.statusCode === 200) {
					// return json object with data
					resolve(JSON.parse(data));
				} else {
					reject(JSON.parse(data));
				}

			});

		});
		req.on('error', (err) => {
			reject("HTTP-error:" + err);
		});

		req.end(body);
	});
}