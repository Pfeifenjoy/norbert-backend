/**
 * @author Tobias Dorra
 */

import {Information} from './information';
import {ObjectId} from 'mongodb';


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

function hideInformation(userID, informationID){
    return this.db.collection('information').findOne({ '_id' : ObjectId(informationID)})
    .then(i => {
      if(i){
        let info = new Information(i);
        let data = info.dbRepresentation;
        this.db.collection('information').update({_id : ObjectId(informationID)}, data);
      }
    })
    .catch(e => {
      console.error(e);
    })
}


module.exports.getInformation = getInformation;
module.exports.hideInformation = hideInformation;