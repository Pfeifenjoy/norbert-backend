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

let oAuthCode = "";
let sharedPath = "";
let storagePath = "";
let token = "";
let uid = "";

var sync = function(infoManager) {
	console.log("-Dropbox Ordner für Norbert freigeben-" + "\n");
	console.log("Bitte besuche folgende Seite und erlaube Norbert - Your StudyBuddy Zugriff auf die Dropbox:");
	console.log(OAUTH_URL + "\n");

	return getCode().then(() => {
		console.log("finished");
		// Get next Stuff...
	});

}



module.exports = {
	"pluginName": "info-provider-dropboxoauth",
	"pluginObject": {
		"sync": sync
	}
};

let getCode = () => {
	const question = "Kopiere den erhaltenen Code hier hinein:";

	return getConsoleInput(question).then(code => {
		oAuthCode = getConsoleInput(question);
		console.log("Frage OAuth Token an...");

		return getToken().then(data => {
				console.log("OAuth Token erhalten! \n");

				token = data["access_token"];
				uid = data["uid"];

				// Write Token to config
			})
			.catch(error => {
				console.log(error["error_description"]);
				return getCode();
			});
	})


}

let getConsoleInput = (question) => {

	let readInput = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false
	});

	return new Promise((resolve, reject) => {
		console.log("Bin im Promise");
		readInput.question(question, (answer) => {
			console.log("Werde nicht ausgeführt...");
			resolve(answer);
		});
	});
}


// Returns a json with the OAuthToken
let getToken = () => {

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
					reject();
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