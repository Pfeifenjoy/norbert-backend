
/**
 * @author: Tobias Dorra
 */

import {NewsFeedObject} from './newsfeed-object';

/**
 * Represents an Information in the newsfeed.
 */
class Information extends NewsFeedObject {

    constructor(dbObject = {}) {
        super(dbObject);

        this._obj.hidden_for = this._obj.hidden_for || [];
        this._obj.extra = this._obj.extra || {};
    }

    /**
     * List of the users who don't see this information
     * because they have removed it from their news feed.
     */
    get hiddenFor() {
        return this._obj.hidden_for;
    }

    set hiddenFor(value) {
        this._obj.hidden_for = value;
    }

    /**
     * The name of the Information Provider,
     * that manages this information
     */
    get provider() {
        // Handle with care - might be undefined.
        return this._obj.provider;
    }

    set provider(value) {
        this._obj.provider = value;
    }

    /**
     * The extra-object allows the provider
     * to store custom data that he needs
     * for synchronisation.
     */
    get extra() {
         return this._obj.extra;
    }

    set extra(value) {
        this._obj.extra = value;
    }

}
module.exports.Information = Information;
