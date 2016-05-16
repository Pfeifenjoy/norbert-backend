/**
 * @author: Simon Oswald, Arwed Mett
 *
 * These functions are used to fetch the newsfeed for the user and to fetch or delete recommendations
 */

import { Entry } from "./entry";
import { ObjectId } from "mongodb";
import assert from "assert";

//Get the relevance of the NewsfeedObject, if there is a notification component, use either the notification date or the createdOn date, whichever is closer to the current date
function getRelevance(newsfeedObject) {
    let notifications = newsfeedObject.notifications;
    if (newsfeedObject.showOnCreation === undefined || newsfeedObject.showOnCreation === true) {
        let createdAt = newsfeedObject.createdAt;
        notifications.push(createdAt);
    }
    let now = Date.now();

    return notifications
        .map(date => Math.abs(date - now))
        .reduce((a, b) => Math.min(a, b), Infinity);
}

//Sort an Array of NewsfeedObjects according to their relevance
function sortRelevance(objects) {
    return objects.sort((a, b) => {
        return getRelevance(a) - getRelevance(b);
    });
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
        .then((a) => a.filter(
            (element, index) => index < filter || element instanceof Entry
        ))
        .then(userRepresentation);
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

    let user_equality_groups = this.db.collection('entries')
        .aggregate([
            {'$match': {'owned_by': {'$eq': userId}}},
            {'$group': {'_id': '$equality_group'}}
        ])
        .toArray()
        .then(arr => arr.map(obj => obj._id));


    let recommendations = user_equality_groups
        .then(groups => {
            return this.db.collection('entries')
                .aggregate([
                    {'$sort': {'created_at': -1}},
                    {'$group': {'_id': '$equality_group', 'recommend': {'$first': '$$CURRENT'}, 'likelihood': {'$first': '$likelihood.' + userId}}},
                    {'$sort': {'likelihood': -1}},
                    {'$match': {'recommend.equality_group': {'$nin': groups}}},
                    {'$match': {'recommend.hidden_for': {'$ne': userId}}},
                    {'$limit': limit}
                ])
                .toArray();
        })
        .then(objs => objs.map(obj => obj.recommend));

    return recommendations
        .then(recommendations => recommendations.map(r => new Entry(r)))
        //.then(sortRelevance)
        .then(userRepresentation)
        .then(recommendations => recommendations.map(recommendation => {
            recommendation.type = "RECOMMENDATION"
            return recommendation;
        }));
}

function acceptRecommendation(userId, entry) {
    // create a new entry without an id
    let newEntryDbObject = entry.dbRepresentation;
    delete newEntryDbObject._id;
    delete newEntryDbObject.created_at;
    let newEntry = new Entry(newEntryDbObject);

    // set the associated user 
    newEntry.owned_by = userId;

    // save
    return this.createEntry(newEntry);
}

module.exports.getNewsfeed = getNewsfeed;
module.exports.deleteRecommendation = deleteRecommendation;
module.exports.getRecommendations = getRecommendations;
module.exports.acceptRecommendation = acceptRecommendation;
