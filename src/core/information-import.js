/**
 * @author Tobias Dorra
 */
import {Information} from './information';
import config from './../utils/configuration';
import {loadPlugins} from '../utils/load-plugins';
import {trigger} from './../task-scheduler/scheduler';
import {forEachAsync} from './../utils/foreach-async';

/**
 * Loads all information providers and imports
 * the information from them.
 */
var importInformation = function() {

	// get the providers from the config file.
	var providerConfig = config.get('informationProviders') || [];
	var providers = loadPlugins(providerConfig);

	// sync each information provider
    let done = forEachAsync(Object.keys(providers), name => {
        console.log('Syncing information: ', name);
		let provider = providers[name];
		let dbAccess = new InfoManager(name, this);
		return provider.sync(dbAccess)
            .then(() => {
                console.log('Synced information: ', name);
            }).catch(() => {
                console.log('Sync failed for: ', name);
            });
    })

	// return the promise
	return done;
};

/**
 * Modifies a MongoDb filter object such that it is limited to
 * the information belonging to the given Provider.
 */
var enhanceFilter = function(filter, provider){
    return {
        '$and': [
            filter,
            {'provider': provider},
            {'deleted': false}
        ]};
};


/**
 * This "class" allows limited access to the Information-collection of mongodb.
 * It is used to give Information Providers the ability to
 * query and update their Information objects, but not those of
 * the other Information Providers.
 */
class InfoManager{

    constructor(informationProviderName, core) {
        this.provider = informationProviderName;
		this.core = core;
        this.information = this.core.db.collection('information');
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
		return this.information.updateMany(actualFilter, {'$set': {'deleted': true}});
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
            insert = preProcess(information, this.provider);
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

function registerInformationTriggers(){
	// get the providers from the config file.
	var providerConfig = config.get('informationProviders') || [];
	var providers = loadPlugins(providerConfig);

	// sync each information provider
    let done = forEachAsync(Object.keys(providers), name => {
		let provider = providers[name];
        if (provider.registerTriggers !== undefined) {
            console.log('Registering triggers for: ', name);
            return provider.registerTriggers(trigger)
                .then(() => {
                    console.log('Registered triggers for: ', name);
                }).catch(() => {
                    console.log('Registration of triggers failed for: ', name);
                });
        }
    });

    return done;
}

module.exports.importInformation = importInformation;
module.exports.registerInformationTriggers = registerInformationTriggers;
