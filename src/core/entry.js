/**
 * @author: Arwed Mett,Simon Oswald
 */

import {NewsFeedObject} from './newsfeedobject';

/**
 * Represents an Entry in the newsfeed.
 */
class Entry extends NewsFeedObject {

    constructor(dbObject = {}) {
        super(dbObject);

        this._obj.tags = this._obj.tags || [];
    }
    set owned_by(owned_by) {
        this._obj.owned_by = owned_by;
    }
    get owned_by() {
        return this._obj.owned_by;
    }

    get tags() {
        return this._obj.tags;
    }
    set hidden_for(hidden_for){
        this._obj.hidden_for = hidden_for;
    }
    get hidden_for(){
        return this._obj.hidden_for;
    }
    set tags(tags) {
        this._obj.tags = tags;
    }
    set equality_group(equality_group) {
        this._obj.equality_group = equality_group;
    }
    get equality_group(){
        return this._obj.equality_group;
    }
    addTags(tags) {
        this._obj.tags.concat(tags);
    }
    hideForUser(userId) {
        this._obj.hidden_for.concat(userId);
    }
    get userRepresentation() {
        let result = super.userRepresentation;
        result.tags = this.tags;
    }
}

module.exports.Entry = Entry;
