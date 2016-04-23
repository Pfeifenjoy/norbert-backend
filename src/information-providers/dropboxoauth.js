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

let infoPath = "";
let storagePath = "";
let token = "";
let uid = "";

var sync = function(infoManager) {
	console.log("\n" + "-- Dropbox für Norbert freigeben --" + "\n");
	console.log("Bitte besuche folgende Seite und erlaube Norbert - Your StudyBuddy Zugriff auf die Dropbox:");
	console.log(OAUTH_URL + "\n");

	return getCode().then(() => {
		return getInfoPath().then(() => {
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

let getCode = () => {
	const question = "Kopiere den erhaltenen Code hier hinein: ";

	return getConsoleInput(question).then(code => {

		console.log("Frage OAuth Token an...");

		return getToken(code).then(data => {
				console.log("OAuth Token erhalten!");

				token = data["access_token"];
				uid = data["uid"];

				config.set("dropbox.uid", uid);
				config.set("dropbox.oAuthToken", token);
			})
			.catch(error => {
				console.log(error["error_description"]);
				return getCode();
			});
	})


}

let getInfoPath = () => {
	const question = "In welchen Ordner soll Norbert nach Informationen suchen? '/pfad': ";

	return getConsoleInput(question).then(infPath => {

		if (infPath === "/") {
			infoPath = infPath;
			config.set("dropbox.informationPath", infoPath);
			config.set("dropbox.informationPathID", "");
			return;
		}

		return checkPath(infPath).then(pathID => {

				infoPath = infPath;

				let pathIDArray = pathID.split(":");

				config.set("dropbox.informationPath", infoPath);
				config.set("dropbox.informationPathID", pathIDArray[pathIDArray.length - 1]);
			})
			.catch(error => {
				console.log(error["error_description"]);
				return getInfoPath();
			});
	});
}

let getStoragePath = () => {
	const question = "In welchen Ordner soll Norbert Dateien ablegen? '/pfad': ";

	return getConsoleInput(question).then(storePath => {

		if (storePath === "/") {
			storagePath = storePath;
			config.set("dropbox.storagePath", storagePath);
			config.set("dropbox.storagePathID", "");
			return;
		}

		return checkPath(storePath).then(pathID => {

				storagePath = storePath;

				let pathIDArray = pathID.split(":");

				config.set("dropbox.storagePath", storagePath);
				config.set("dropbox.storagePathID", pathIDArray[pathIDArray.length - 1]);
			})
			.catch(error => {
				console.log(error["error_description"]);
				return getStoragePath();
			});
	});

}

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