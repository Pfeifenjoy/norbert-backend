/**
 * @author Simon Oswald, Arwed Mett
 */
import { Entry } from './entry.js';
import { Information} from './information.js';


//Get all Entries with a notification-component
function getNotificationsEntries(userID){
	//This query fetches all entries with at least one notification-component where the date is greater than the current date
	let query = { 'owned_by' : userID , 'deleted' : false, 'components' : { $elemMatch : { type  : 'components-notification', 'data.date' : { $gt : Date.now() } }}}
 	let cursor = this.db.collection('entries').find(query);
    let dbResult = cursor.toArray();
    let result = dbResult.then(array => {
	        return array
	        .filter(e => !e.deleted)
	        .map(e => new Entry(e));
	    });
    return result;
}

//Get all Information with a notification-component
function getNotificationsInformation(userID){
	//This query fetches all information with at least one notification-component where the date is greater than the current date
	let query = { 'deleted' : false , 'components' : { $elemMatch : { type  : 'components-notification', 'data.date' : { $gt : Date.now() } }}}
	let cursor = this.db.collection('information').find(query);
	let dbResult = cursor.toArray();
	let result = dbResult.then(array => {
	       return array
	       .filter(i => !i.deleted)
	       .map(i => new Information(i));
		});
	return result;
}

//Get all Entries and Information with a notification-component
function getNotifications(userID){
	//Fetch the relevant Entries and Information seperately
	let promises = [this.getNotificationsInformation.bind(this)(userID), this.getNotificationsEntries.bind(this)(userID)];
	//Merge them into one Promise
	return Promise.all(promises)
	//Merge the 2 Arrays
	.then(([a, b]) => a.concat(b))
	.then(newsfeedObjects => newsfeedObjects.map(object => object.userRepresentation))
	//Only keep the ObjectID and the notification-component
	.then(newsfeedObject => newsfeedObject.map(object => {
		return {
			id: object.id,
			components: object.components.filter(c => c.type === "components-notification")
		}
	}))
	//Filter out newsfeedObjects without components
	.then(newsfeedObject => newsfeedObject.filter(object => object.components.length > 0))
	//Only keep the ObjectID and the date of the notification-component
	.then(newsfeedObjects => newsfeedObjects.map(object => {
		return object.components.map(c => { return { id: object.id, date: c.data.date }} )
	}))
	.then(newsfeedObjects => newsfeedObjects.reduce((a, b) => a.concat(b)))
}

module.exports.getNotificationsEntries = getNotificationsEntries;
module.exports.getNotificationsInformation = getNotificationsInformation;
module.exports.getNotifications = getNotifications;
