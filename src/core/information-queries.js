/**
 * @author Tobias Dorra
 */

import {Information} from './information';
import {ObjectId} from 'mongodb';


function getInformation(userID){
	let query = {hidden_for : {$ne : userID}};
	let InformationCursor = this.db.collection('information').find(query);
	console.log('infos');
   	let dbResult = InformationCursor.toArray();
   	let result = dbResult.then(array => {
       return array
       .filter(i => !i.deleted)
       .map(i => new Information(i));
   });
   return result;
}

function findDirtyInformation(){
    return this.db.collection("information")
        .find({'dirty': {'$eq': true}, 'deleted': {'$eq': false}})
        .toArray()
        .then(data => {
            return data.map(e => new Information(e));
        });
}

function findDeletedInformation(){
    return this.db.collection("information")
        .find({'dirty': {'$eq': true}, 'deleted': {'$eq': true}})
        .toArray()
        .then(data => {
            return data.map(e => new Information(e));
        });
}

function getInformationCount(){
     return this.db.collection('information').count();
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

function updateInformation(info) {
  info.dirty = true;
  let data = info.dbRepresentation;
  let filter = {'_id': info.id};
  return this.information.replaceOne(filter, data);
}


module.exports.getInformation = getInformation;
module.exports.findDirtyInformation = findDirtyInformation;
module.exports.findDeletedInformation = findDeletedInformation;
module.exports.getInformationCount = getInformationCount;
module.exports.hideInformation = hideInformation;
module.exports.updateInformation = updateInformation;

