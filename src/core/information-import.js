/**
 * @author Tobias Dorra
 */
import {Information} from './information';
import config from './../utils/configuration';
import {loadPlugins} from '../utils/load-plugins';

/**
 * Loads all information providers and imports
 * the information from them.
 */
var importInformation = function() {
	// Use a promise for synchronisation
	var sync = Promise.resolve();
	
	// get the providers from the config file.
	var providerConfig = config.get('informationProviders') || [];
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
 * This "class" allows limited access to the Information-collection of mongodb.
 * It is used to give Information Providers the ability to
 * query and update their Information objects, but not those of
 * the other Information Providers.
 */
class InfoManager{

    constructor(informationProviderName, database) {
        this.provider = informationProviderName;
        this.db = database;
        this.information = this.db.collection('information');
    }


    /**
     * Find information
     */
    find(filter) {
        var actualFilter = enhanceFilter(filter, this.provider);
        var cursor = this.information.find(actualFilter);
        return cursor;
    }

    /**
     * Find exactly one information
     */
    findOne(filter) {
        var actualFilter = enhanceFilter(filter, this.provider);
        return this.information.findOne(actualFilter);
    }

    /**
     * Delete information
     */
    remove(filter){
        var actualFilter = enhanceFilter(filter, this.provider);
        return this.information.remove(actualFilter);
    }

    /**
     * Insert information
     */
    insert(information) {

        var preProcess = function(information, provider) {
            // transform the document to be compatible
            // with the database layout
            var infoObject;
            if (information instanceof Information) {
                infoObject = information;
            } else {
                infoObject = new Information(information);
            }

            infoObject.provider = provider;
            infoObject.dirty = true;

            return infoObject.dbRepresentation;
        };

        var insert;
        if (information instanceof Array) {
            insert = information.map(i => preProcess(i, this.provider));
        } else {
            insert = preProcess(information);
        }

        // insert into mongo
        return this.information.insert(insert);
    }

    /**
     * Replace the given Information
     */
    update(information) {

        // transform the update to be compatible
        // with the database layout
        var infoObject;
        if (information instanceof Information) {
            infoObject = information;
        } else {
            infoObject = new Information(information);
        }

        infoObject.dirty = true;
        infoObject.provider = this.provider;

        // do the replace
        var dbObject = infoObject.dbRepresentation;
        var filter = {'_id': infoObject.id, 'provider': this.provider};
        return this.information.replaceOne(filter, dbObject);
    }

}

module.exports.importInformation = importInformation;
