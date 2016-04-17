/**
 * @author: Tobias Dorra
 */

import clone from '../utils/clone';
import config from '../utils/configuration';

/**
 * Loads all information providers and imports 
 * the information from them.
 */
var importInformation = function() {
	// Use a promise for synchronisation
	var sync = Promise.resolve();

	// get the providers from the config file.
	var providers = config.get('informationProviders') || [];

	// sync each information provider
	for (var provider of providers) {
		sync = sync.then(() => {
			var pName = provider.name;
			var pModule = provider.module;
			var pObject = require(__dirname + '/../' + pModule);
			var dbAccess = new InfoManager(pName, this.db);
			return pObject.sync(dbAccess);
		});
	}

	// return the promise
	return sync;
};

/**
 * This "class" allows limited access to the Information-collection of mongodb.
 * It is used to give Information Providers the ability to 
 * query and update their Information objects, but not those of 
 * the other Information Providers.
 */
var InfoManager = function(informationProviderName, database) {
	this.provider = informationProviderName;
	this.db = database;
	this.information = this.db.collection('information');
};

InfoManager.prototype.enhanceFilter = function(filter){
	return {
		'$and': [
			filter, 
			{'provider':this.provider}
		]};
};

InfoManager.prototype.find = function(filter)
{
	var actualFilter = this.enhanceFilter(filter);
	var cursor = this.information.find(actualFilter);
	cursor.stream({'transform': function (doc){return {'aloha': 'world!'};}});
	return cursor;
};

InfoManager.prototype.findOne = function(filter)
{
	var actualFilter = this.enhanceFilter(filter);
	return this.information.findOne(actualFilter);
};

InfoManager.prototype.remove = function(filter){
	var actualFilter = this.enhanceFilter(filter);
	return this.information.remove(actualFilter);
};

InfoManager.prototype.insert = function(information){

	// transform the document to be compatible
	// with the database layout
	var doc = Object.assign({}, information);
	doc.provider   = this.provider;
	doc.dirty      = true;
	doc.hidden_for = [];
	doc.created_at = doc.created_at || Date.now();
	doc.title      = doc.title      || "";
	doc.components = doc.components || [];
	delete doc._id;

	// insert into mongo
	return this.information.insert(doc);
};

InfoManager.prototype.update = function(){ /* TODO */ };

module.exports.importInformation = importInformation;