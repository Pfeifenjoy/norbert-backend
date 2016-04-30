/**
 * @author: Simon Oswald
 */

import { Entry } from "./entry";
import { ObjectId } from "mongodb";


function getNewsfeed(userID){
    return this.db.collection("entries").find({owned_by : ObjectId(userID)});
}

function deleteRecommendation(entryID,userID){
	let entry = new Entry(this.db.collection("entries").findOne({_id: ObjectId(entryID)}));
	entry.hideForUser(userID);
	return this.updateEntry(entry);
}

function getReccomendations(userID){
	return this.db.collection("entries").find({ owned_by : { $ne : ObjectId(userID)}});
}

module.exports.getNewsfeed = getNewsfeed;
module.exports.deleteRecommendation = deleteRecommendation;
module.exports.getReccomendations = getReccomendations;