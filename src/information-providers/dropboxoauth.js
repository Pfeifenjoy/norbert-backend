/*
 * @author: Philipp Pütz
 */
import config from '../utils/configuration.js';

let https = require('https');
let querystring = require('querystring');
let readline = require('readline');

const APP_KEY = "wr6x0p7m1ti0xr3";
const APP_SECRET = "32n05z1iigu0tns";
const OAUTH_URL = "https://www.dropbox.com/1/oauth2/authorize?client_id=" + APP_KEY + "&response_type=code";

let token = "";

/* initDropbox
 * Asks the user to specify important information to let norbert
 * get access to the users dropbox account.
 *
 * returns promise
 */
var sync = function(infoManager) {
	console.log("\n" + "-- Dropbox für Norbert freigeben --" + "\n");

	// Ask dropbox oauth code
	return getCode().then(() => {
		// Ask path where norbert should search for information/files
		return getInfoPath().then(() => {
			// Ask path where norbert can store uploaded files
			return getStoragePath().then(() => {
				console.log("Norbert - Your StudyBuddy hat nun alle Informationen um mit deiner Dropbox zu interagieren!");
			});
		});
	});

}

module.exports = {
	"pluginName": "info-provider-dropboxoauth",
	"pluginObject": {
		"sync": sync
	}
};

/* getCode
 * Ask the user to enter the dropbox oauth code.
 *
 * returns a promise
 */
let getCode = () => {

	console.log("Bitte besuche folgende Seite und erlaube Norbert - Your StudyBuddy Zugriff auf die Dropbox:");
	console.log(OAUTH_URL + "\n");

	const question = "Kopiere den erhaltenen Code hier hinein: ";

	// Catch the console input
	return getConsoleInput(question).then(code => {

		console.log("Frage OAuth Token an...");

		// Interchange the oauth code with a oauth token
		return getToken(code).then(data => {
				console.log("OAuth Token erhalten!");

				token = data["access_token"];

				// Save the data to the config
				config.set("dropbox.uid", data["uid"]);
				config.set("dropbox.oAuthToken", token);
			})
			.catch(error => {
				// log error and retry ...
				console.log(error["error_description"]);
				return getCode();
			});
	})


}

/* getInfoPath
 * Ask the user to enter a path where norbert should search for information
 *
 * returns a promise
 */
let getInfoPath = () => {
	const question = "In welchen Ordner soll Norbert nach Informationen suchen? '/pfad': ";

	// Catch the console input
	return getConsoleInput(question).then(infoPath => {

		if (infoPath === "/") {
			// root folder
			config.set("dropbox.informationPath", infoPath);
			config.set("dropbox.informationPathID", "");
			return Promise.resolve();
		}

		// Check if the path exists
		return checkPath(infoPath).then(pathID => {
				config.set("dropbox.informationPath", infoPath);
				config.set("dropbox.informationPathID", pathID.substring(pathID.lastIndexOf(":") + 1));
			})
			.catch(error => {
				// log error message and retry
				console.log(error["error_description"]);
				return getInfoPath();
			});
	});
}

/* getStoragePath
 * Ask the user to enter a path where norbert can store files
 *
 * returns a promise
 */
let getStoragePath = () => {
	const question = "In welchen Ordner soll Norbert Dateien ablegen? '/pfad': ";

	// Catch the console input
	return getConsoleInput(question).then(storagePath => {

		if (storagePath === "/") {
			// root folder
			config.set("dropbox.storagePath", storagePath);
			config.set("dropbox.storagePathID", "");
			return Promise.resolve();
		}

		// Check if the path exists
		return checkPath(storagePath).then(pathID => {
				config.set("dropbox.storagePath", storagePath);
				config.set("dropbox.storagePathID", pathID.substring(pathID.lastIndexOf(":") + 1));
			})
			.catch(error => {
				// log error message and retry
				console.log(error["error_description"]);
				return getStoragePath();
			});
	});

}

// Asks the user a question an returns the answer
let getConsoleInput = (question) => {

	let readInput = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false
	});

	return new Promise((resolve, reject) => {
		readInput.question(question, answer => {
			readInput.close();
			resolve(answer);
		});
	});
}


// Returns a json with the OAuthToken
let getToken = (oAuthCode) => {

	const domain = "api.dropboxapi.com";
	const pathUrl = "/oauth2/token";

	// HTTP-Body
	var body = "code=" + oAuthCode + "&grant_type=authorization_code";

	// Authentication
	var auth = 'Basic ' + new Buffer(APP_KEY + ':' + APP_SECRET).toString('base64');

	// An object of options to indicate where to post to
	var post_options = {
		host: domain,
		path: pathUrl,
		method: 'POST',
		headers: {
			'Authorization': auth,
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
					resolve(JSON.parse(response));
				} else {
					reject(JSON.parse(response));
				}

			});

		});

		req.on('error', (e) => {
			reject("HTTP-error:" + e);
		});

		// Fire the request
		req.end(body);
	});

};

let checkPath = (path) => {

	const domain = "api.dropboxapi.com";
	const pathUrl = "/2/files/get_metadata";

	// HTTP-Body
	var body = JSON.stringify({
		"path": path
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: domain,
		path: pathUrl,
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
					resolve(JSON.parse(response)["id"]);
				} else {
					reject(JSON.parse(response));
				}

			});

		});

		req.on('error', (e) => {
			reject("HTTP-error:" + e);
		});

		// Fire the request
		req.end(body);
	});

};