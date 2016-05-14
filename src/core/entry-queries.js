/**
 * @author: Arwed Mett,Simon Oswald
 */

import { ObjectId } from "mongodb";
import { Entry } from "./entry";

function createEntry(entry) {
    let data = entry.dbRepresentation;
    return this.db.collection("entries").insertOne(data)
        .then(cursor => {
            return new Entry(cursor.ops[0])
        });
}

function getEntry(id) {
    return this.db.collection("entries").findOne({_id: ObjectId(id)})
        .then(data => {
            return new Entry(data);
        });
}

//Return all entries of this specific user
function getEntries(userId){
    let query = {owned_by : userId, deleted: false};
    let entryCursor = this.db.collection('entries').find(query);
    let dbResult = entryCursor.toArray();
    let result = dbResult.then(data => {
       return data.map(e => new Entry(e));
    });
    return result;
}

function updateEntry(entry) {
    entry.dirty = true;
    let data = entry.dbRepresentation;
    let id = entry.id;
    delete data._id;
    return this.db.collection("entries").findAndModify(
        {_id: id}, [], {"$set": data}, {"new": true}
    ).then(cursor => {
        let newData = cursor.value;
        let newEntry = new Entry(newData);
        return newEntry;
    });
}

function deleteEntry(entry){
    entry.deleted = true;
    return updateEntry.bind(this)(entry);
}

function findDirtyEntries(){
    return this.db.collection("entries")
        .find({'dirty': true, 'deleted': false})
        .toArray()
        .then(data => {
            return data.map(e => new Entry(e));
        });
}

function findDeletedEntries(){
    return this.db.collection("entries")
        .find({'deleted': true})
        .toArray()
        .then(data => {
            return data.map(e => new Entry(e));
        });
}

function getEntryCount(){
     return this.db.collection('entries').count();
}

function getEntriesOrderedByUser(){
     return this.db.collection('entries')
         .find({'deleted': false})
         .sort({'owned_by': 1})
         .toArray()
         .then(objects => objects.map(o => new Entry(o)));
}

module.exports = {
    createEntry,
    getEntry,
    getEntries,
    updateEntry,
    deleteEntry,
    findDirtyEntries,
    findDeletedEntries,
    getEntryCount,
    getEntriesOrderedByUser
};

