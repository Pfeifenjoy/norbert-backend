/**
 * @author: Simon Oswald, Arwed Mett
 */

import { Entry } from "./entry";
import { ObjectId } from "mongodb";
import assert from "assert";


//Get the relevance of the NewsfeedObject, if there is a notification component, use either the notification date or the createdOn date, whichever is closer to the current date
function getRelevance(newsfeedObject) {
    return [newsfeedObject.createdAt]
    .concat(newsfeedObject.components
     .filter(c => { return c && c.type === "components-notification" })
     .map(c => c.data.date)
    )
    .map(time => Math.abs(Date.now() - time))
    .reduce((a, b) => Math.min(a, b))
}

//Sort an Array of NewsfeedObjects according to their relevance
function sortRelevance(objects) {
    return objects.sort((a, b) => {
        return getRelevance(a) - getRelevance(b);
    })
}

function userRepresentation(objects) {
    return objects.map(object => object.userRepresentation);
}

//Build the newsfeed by fetching entries and information, then merging, sorting and filtering them
function getNewsfeed(userId, filter=50){
	let promises = [this.getEntries(userId), this.getInformation(userId)];
    return Promise.all(promises)
    .then(([a, b]) => a.concat(b))
    .then(sortRelevance)
    .then((a) => a.slice(1,filter))
    .then(userRepresentation)
}

//Delete a recommendation, the user will not get that recommendation again
function deleteRecommendation(entryId,userId){
    return this.getEntry(entryId)
    .then(entry => {
        entry.hideForUser([userId])
        console.log(entry);
        return this.updateEntry(entry)
    })
}

//Get the recommended Entries for this user
function getRecommendations(userId, limit=10){
    let sortby = {};
    sortby['likelihood.' + userId] = 1;
    let cursor = this.db.collection("entries")
    .find({ $where: `this.owned_by !== "${userId}" && this.hidden_for instanceof Array && this.hidden_for.indexOf("${userId}") === -1` })
    .sort(sortby)
    .limit(limit)
    return new Promise((resolve, reject) => {
        let recommendations = [];
        cursor.each((err, doc) => {
            assert.equal(err, null);
            if(doc !== null) {
                recommendations.push(doc);
            } else resolve(recommendations)
        })
    })
    .then(recommendations => recommendations.map(r => new Entry(r)))
    //.then(sortRelevance)
    .then(userRepresentation)
    .then(recommendations => recommendations.map(recommendation => {
        recommendation.type = "RECOMMENDATION"
        return recommendation;
    }));
}


//Return all entries of this specific user
function getEntries(userId){
	let query = {owned_by : userId};
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
module.exports.getRecommendations = getRecommendations;
