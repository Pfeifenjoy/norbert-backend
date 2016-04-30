/**
 * @author: Tobias Dorra
 */

import config from '../utils/configuration.js';
import mongo from 'mongodb';
import users from './user-queries';
import infos from './information-queries';
import infos_import from './information-import';
import entries from './entry-queries';
import newsfeed from './newsfeed-queries';
import file from "./file";
import file_upload from './file-upload';
import text_extractor from './text-extractor';

/**
 * Core:
 * A core object is a collection of functions
 * working on a database that is stored in
 * an instance of this class.
 */
function Core(dbConnection){
	this.db = dbConnection;
};

// Assign the modules to the core
Object.assign(Core.prototype, users);
Object.assign(Core.prototype, infos);
Object.assign(Core.prototype, infos_import);
Object.assign(Core.prototype, entries);
Object.assign(Core.prototype, newsfeed);
Object.assign(Core.prototype, file);
Object.assign(Core.prototype, file_upload);
Object.assign(Core.prototype, text_extractor);


/**
 * createCore:
 * A utility method that creates a core using
 * the default database connection configured
 * at 'database.url' in the config file.
 */
var default_db_url = null;
var default_db = null;
function createCore() {
	var url = config.get('database.url');
	if (url === undefined) {
		throw "There is an error in the config file: Setting database.url is required.";
	}

	// reuse the old db connection if possible
	if (default_db !== null && default_db_url == url) {
		return new Core(default_db);
	}

	// connect to the database
	var promise = mongo.MongoClient.connect(url)
		.then(function(db){
			default_db_url = url;
			default_db = db;
			var core = new Core(db);
			return core;
		});

	// return the final promise.
	return promise;
};


module.exports.Core = Core;
module.exports.createCore = createCore;
