/**
 * @author: Simon Oswald, Arwed Mett
 */

import { Entry } from "./entry";
import { ObjectId } from "mongodb";

function getRelevance(newsfeedObject) {
    return [newsfeedObject.createdAt]
    .concat(newsfeedObject.components
     .filter(c => { return c && c.type === "components-notification" })
     .map(c => c.data.date)
    )
    .map(time => Math.abs(Date.now() - time))
    .reduce((a, b) => Math.min(a, b))
}

function getNewsfeed(userID){
	let promises = [this.getEntries(userID), this.getInformation(userID)];
    return Promise.all(promises)
    .then(([a, b]) => a.concat(b))
    .then(newsfeedObjects => newsfeedObjects.sort((a, b) => {
        return getRelevance(a) - getRelevance(b);
    }))
    .then(objects => objects.map(object => object.userRepresentation))
}

function splitNmerge([a,b]){
	return a.concat(b);
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
