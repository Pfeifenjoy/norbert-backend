/**
 * @author: Arwed Mett,Simon Oswald
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

export function deleteEntry(entryID,userID){
    return this.db.collection("entries").remove({_id : ObjectId(entryID), owned_by : userID});
}

