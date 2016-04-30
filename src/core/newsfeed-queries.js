/**
 * @author: Simon Oswald
 */

import { Entry } from "./entry";
import { ObjectId } from "mongodb";

function getNewsfeed(userID){
	let promises = [this.getEntries(userID), this.getInformation(userID)];
	return Promise.all(promises);
   	
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
	return this.db.collection("entries").find({ owned_by : { $ne : ObjectId(userID)}}).limit(10);
}

function getEntries(userID){
	let query = {owned_by : userID};
   	let entryCursor = this.db.collection('entries').find(query);
   	console.log('entries');
   	let dbResult = entryCursor.toArray();
   	let result = dbResult.then(array => {
       return array
       .filter(e => !e.deleted)
       .map(e => new Entry(e));
   	});
   	return result;
}


module.exports.getEntries = getEntries;
module.exports.getNewsfeed = getNewsfeed;
module.exports.deleteRecommendation = deleteRecommendation;
module.exports.getReccomendations = getReccomendations;