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
let has_more = false;


var sync = function(infoManager) {
	console.log("Dropbox here!");

	initCrawler();

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