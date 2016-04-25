/**
 * @author: Arwed Mett,Simon Oswald
 */

import { ObjectId } from "mongodb";
import { Entry } from "./entry";

function createEntry(entry) {
    return this.db.collection("entries").insertOne(entry)
    .then(cursor => {
        return cursor.ops[0]
    })
}

function getEntry(id) {
    return this.db.collection("entries").findOne({_id: ObjectId(id)})
}

function updateEntry(id, entry) {
    console.log(entry);
    id = ObjectId(id);
    return this.db.collection("entries").findAndModify(
        {_id: id}, [], {"$set": entry}, {"new": true})
    .then(cursor => {
        return cursor.value
    })
}

function deleteEntry(entryID,userID){
    return this.db.collection("entries").remove({_id : ObjectId(entryID), owned_by : userID});
}

export default {
    createEntry,
    getEntry,
    updateEntry,
    deleteEntry
}

