/**
 * @author: Arwed Mett,Simon Oswald
 */

import { ObjectID } from "mongodb";
import { Entry } from "./entry";

export function createEntry(entry) {
    let data = entry.dbRepresentation;
    return this.db.collection("entries").insertOne(data)
        .then(cursor => {
            return new Entry(cursor.ops[0]);
        });
}

function getEntry(id) {
    return this.db.collection("entries").findOne({_id: ObjectID(id)})
        .then(data => {
            return new Entry(data);
        });
}

export function updateEntry(entry) {
    entry.dirty = true;
    let data = entry.dbRepresentation;
    delete data._id;
    let id = entry.id;
    return this.db.collection("entries").findAndModify(
        {_id: ObjectID(id)}, [], {"$set": data}, {"new": true}
    ).then(cursor => {
        let newData = cursor.value;
        let newEntry = new Entry(newData);
        return newEntry;
    });
}

export function deleteEntry(entry){
    entry.deleted = true;
    return updateEntry.bind(this)(entry);
}

export default {
    createEntry,
    getEntry,
    updateEntry,
    deleteEntry
}

