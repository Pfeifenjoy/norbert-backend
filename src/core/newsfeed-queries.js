/**
 * @author: Simon Oswald
 */
import {Entry} from './entry';

import { Entry } from "./entry";
import { ObjectId } from "mongodb";


function getNewsfeed(userID){
    return this.db.collection("entries").find({owned_by : ObjectId(userID)});
}

function deleteRecommendation(entryID,userID){
    let query = {owned_by : userID};
    let entryCursor = this.db.collection('entries').find(query);
    let dbResult = entryCursor.toArray();
    let result = dbResult.then(array => {
        return array
        .filter(e => !e.deleted)
        .map(e => new Entry(e));
    });

    return result;
}

function getReccomendations(userID){
	return this.db.collection("entries").find({ owned_by : { $ne : ObjectId(userID)}});
}

module.exports.getNewsfeed = getNewsfeed;
module.exports.deleteRecommendation = deleteRecommendation;
module.exports.getReccomendations = getReccomendations;