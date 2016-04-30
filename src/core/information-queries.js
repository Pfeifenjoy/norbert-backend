/**
 * @author Tobias Dorra
 */

import {Information} from './information';


function getInformation(userID){
	let query = {hidden_for : {$ne : userID}};
	let InformationCursor = this.db.collection('information').find(query).limit(10);
	console.log('infos');
   	let dbResult = InformationCursor.toArray();
   	let result = dbResult.then(array => {
       return array
       .filter(i => !i.deleted)
       .map(i => new Information(i));
   });
   return result;
}


module.exports.getInformation = getInformation;