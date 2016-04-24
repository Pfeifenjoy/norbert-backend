/**
 * @author: Arwed Mett,Simon Oswald
 */

import { ObjectId } from "mongodb";
import { Entry } from "./entry";

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
