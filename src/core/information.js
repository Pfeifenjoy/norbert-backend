/**
 * @author: Tobias Dorra
 */

import clone from '../utils/clone';
import config from '../utils/configuration';
import {loadPlugins} from '../utils/load-plugins';

/**
 * Loads all information providers and imports
 * the information from them.
 */
var importInformation = function() {
	// Use a promise for synchronisation
	var sync = Promise.resolve();
	
	// get the providers from the config file.
	var providerConfig = config.get('informationProviders') || {};
	var providers = loadPlugins(providerConfig);

	// sync each information provider
	for (var name of Object.keys(providers)) {
		let provider = providers[name];
		sync = sync.then(() => {
			var dbAccess = new InfoManager(name, this.db);
			return provider.sync(dbAccess);
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

/**
 * Modifies a MongoDb filter object such that it is limited to
 * the information belonging to the given Provider.
 */
var enhanceFilter = function(filter, provider){
	return {
		'$and': [
			filter,
			{'provider':this.provider}
		]};
};

/**
 * Takes a Component list and replaces all components by
 * their actual database representation.
 */
var flattenComponents = function(oldComponents) {
	var newComponents = oldComponents.map((component) => {
		if (component.constructor === Object) {
			return component;
		} else {
			return {
				"type": component.getPluginName(),
				"generated": false,
				"data": component.getDbRepresentation()
			};
		}
	});

	return newComponents;
}

/**
 * Find information
 */
InfoManager.prototype.find = function(filter)
{
	var actualFilter = enhanceFilter(filter, this.provider);
	var cursor = this.information.find(actualFilter);
	return cursor;
};

/**
 * Find exactly one information
 */
InfoManager.prototype.findOne = function(filter)
{
	var actualFilter = enhanceFilter(filter, this.provider);
	return this.information.findOne(actualFilter);
};

/**
 * Delete information
 */
InfoManager.prototype.remove = function(filter){
	var actualFilter = enhanceFilter(filter, this.provider);
	return this.information.remove(actualFilter);
};

/**
 * Insert information
 */
InfoManager.prototype.insert = function(information){

	// transform the document to be compatible
	// with the database layout
	var doc = Object.assign({}, information);
	doc.provider   = this.provider;
	doc.dirty      = true;
	doc.hidden_for = [];
	doc.created_at = doc.created_at || Date.now();
	doc.title      = doc.title      || "";
	doc.components = flattenComponents(doc.components || []);

	// insert into mongo
	return this.information.insert(doc);
};

/**
 * Update information
 */
InfoManager.prototype.update = function(filter, update){
	// Restrict the update to documents owned by this provider
	var actualFilter = enhanceFilter(filter, this.provider);

	// transform the update to be compatible
	// with the database layout
	var actualUpdate = Object.assign({}, update);
	if (actualUpdate.components !== undefined) {
		actualUpdate.components = flattenComponents(actualUpdate.components);
	}
	actualUpdate.dirty = true;
	delete actualUpdate.provider;

	// apply the update in mongodb
	// TODO (no internet - google needed)
};

module.exports.importInformation = importInformation;
