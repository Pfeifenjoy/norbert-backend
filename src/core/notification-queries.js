/**
 * @author Simon Oswald, Arwed Mett
 */
import { Entry } from './entry.js';
import { Information} from './information.js';

function getNotificationsEntries(userID){
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

function getNotificationsInformation(userID){
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
function getNotifications(userID){
	let promises = [this.getNotificationsInformation.bind(this)(userID), this.getNotificationsEntries.bind(this)(userID)];
	return Promise.all(promises)
	.then(([a, b]) => a.concat(b))
	.then(newsfeedObjects => newsfeedObjects.map(object => object.userRepresentation))
	.then(newsfeedObject => newsfeedObject.map(object => {
		return {
			id: object.id,
			components: object.components.filter(c => c.type === "components-notification")
		}
	}))
	.then(newsfeedObject => newsfeedObject.filter(object => object.components.length > 0))
	.then(newsfeedObjects => newsfeedObjects.map(object => {
		return object.components.map(c => { return { id: object.id, date: c.data.date }} )
	}))
	.then(newsfeedObjects => newsfeedObjects.reduce((a, b) => a.concat(b)))
}

module.exports.getNotificationsEntries = getNotificationsEntries;
module.exports.getNotificationsInformation = getNotificationsInformation;
module.exports.getNotifications = getNotifications;
