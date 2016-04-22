/**
 * @author: Arwed Mett
 */

import {NewsFeedObject} from './newsfeed-object';
import { ObjectId } from "mongodb";

/**
 * Represents an Information in the newsfeed.
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

    set tags(tags) {
        this._obj.tags = tags;
    }
    addTags(tags) {
        this._obj.tags.concat(tags);
    }
}

module.exports.Entry = Entry;

export function createEntry(entry) {
    return this.db.collection("entries").insertOne(entry)
    .then(cursor => {
        return cursor.ops[0]
    })
}

export function getEntry(id) {
    return this.db.collection("entries").findOne({_id: ObjectId(id)})
}

export function updateEntry(id, entry) {
    console.log(entry);
    id = ObjectId(id);
    return this.db.collection("entries").findAndModify(
        {_id: id}, [], {"$set": entry}, {"new": true})
    .then(cursor => {
        return cursor.value
    })
}
