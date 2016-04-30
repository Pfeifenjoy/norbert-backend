import { Entry } from './entry.js';
import { Information} from './information.js';

function getNotificationsEtries(userID){
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
	let promises = [this.getNotificationsInformation(userID), this.getNotificationsEtries(userID)];
	return Promise.all(promises)
}
module.exports.getNotificationsEtries = getNotificationsEtries;
module.exports.getNotificationsInformation = getNotificationsInformation;
module.exports.getNotifications = getNotifications;