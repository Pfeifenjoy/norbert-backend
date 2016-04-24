/**
 * Author: Tobias Dorra
 */

import {loadComponents} from './components';

class NewsFeedObject {

    constructor(dbObject) {
        this._obj = dbObject;
        this._obj.title = this._obj.title || '';
        this._obj.components = this._obj.components || [];
        if (this._obj.dirty === undefined) {
            this._obj.dirty = true;
        }
        this._obj.created_at = this._obj.created_at || Date.now();
        this._components = loadComponents(this._obj.components);
    }

    /**
     * Unique ID
     */
    get id() {
        // the (database) id. Might be undefined!
        return this._obj._id;
    }

    /**
     * Title
     */
    get title(){
        return this._obj.title;
    }

    set title(value){
        this._obj.title = value;
    }

    /**
     * Timestamp that specifies, when it was created.
     * (Unit: Milliseconds)
     */
    get createdAt() {
         return this._obj.created_at;
    }

    set createdAt(value) {
        this._obj.created_at = value;
    }

    /**
     * The components
     */
    get components() {
        return loadComponents(this._components);
    }

    set components(value) {
        this._components = loadComponents(value);
    }

    /**
     * Is it necessary for the batchprocess to reprocess it?
     * (Search index, Recommendations, ...)
     */
    get dirty() {
         return this._obj.dirty;
    }

    set dirty(value) {
         this._obj.dirty = value;
    }

    /**
     * Returns all notifications, collected from all the components.
     */
    get notifications() {
        let result = this.components.map(
            component => component.getNotifications()
        ).reduce(
            (a, b) => a.concat(b)
        );
        return result;
    }

    /**
     * Returns an object that can be stored in the database.
     */
    get dbRepresentation() {

        // serialize the components
        let components = this.components.map(
            component => component.dbRepresentation
        );

        // assemble the object for the database.
        let dbObj = Object.assign({}, this._obj);
        dbObj.components = components;

        // return
        return dbObj;
    }
};

module.exports.NewsFeedObject = NewsFeedObject;

