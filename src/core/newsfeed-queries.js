/**
 * @author: Simon Oswald, Arwed Mett
 */

import { Entry } from "./entry";
import { ObjectId } from "mongodb";
import assert from "assert";

function getRelevance(newsfeedObject) {
    return [newsfeedObject.createdAt]
    .concat(newsfeedObject.components
     .filter(c => { return c && c.type === "components-notification" })
     .map(c => c.data.date)
    )
    .map(time => Math.abs(Date.now() - time))
    .reduce((a, b) => Math.min(a, b))
}

function sortRelevance(objects) {
    return objects.sort((a, b) => {
        return getRelevance(a) - getRelevance(b);
    })
}

function userRepresentation(objects) {
    return objects.map(object => object.userRepresentation);
}

function getNewsfeed(userId){
	let promises = [this.getEntries(userId), this.getInformation(userId)];
    return Promise.all(promises)
    .then(([a, b]) => a.concat(b))
    .then(sortRelevance)
    .then(userRepresentation)
}




function deleteRecommendation(entryId,userId){
    return this.getEntry(entryId)
    .then(entry => {
        entry.hideForUser([userId])
        console.log(entry);
        return this.updateEntry(entry)
    })
}

function getRecommendations(userId, limit=10){
    let cursor = this.db.collection("entries")
    .find({ $where: `this.owned_by !== "${userId}" && this.hidden_for instanceof Array && this.hidden_for.indexOf("${userId}") === -1` })
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
    .then(sortRelevance)
    .then(userRepresentation)
    .then(recommendations => recommendations.map(recommendation => {
        recommendation.type = "RECOMMENDATION"
        return recommendation;
    }))
}

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
