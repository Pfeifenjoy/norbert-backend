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
        this.components = loadComponents(this._obj.components);
    }

    get id() {
        // the (database) id. Might be undefined!
        return this._obj._id;
    }

    get title(){
        return this._obj.title;
    }

    set title(value){
        this._obj.title = value;
    }

    get createdAt() {
         return this._obj.created_at;
    }

    set createdAt(value) {
        this._obj.created_at = value;
    }

    get dirty() {
         return this._obj.dirty;
    }

    set dirty(value) {
         this._obj.dirty = value;
    }

    get dbRepresentation() {
        var components = this.components.map(
                component => component.dbRepresentation);
        var dbObj = Object.assign({}, this._obj);
        dbObj.components = components;
        return dbObj;
    }
};

module.exports.NewsFeedObject = NewsFeedObject;

