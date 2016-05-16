/**
 * @author Tobias Dorra, Simon Oswald
 *
 * These functions are used to fetch, hide or edit Information 
 */

import {Information} from './information';
import {ObjectId} from 'mongodb';

//Get all Information for this user
function getInformation(userID){
	let query = {hidden_for : {$ne : ObjectId(userID)}, deleted: false};
	let InformationCursor = this.db.collection('information').find(query);
  let dbResult = InformationCursor.toArray();
  let result = dbResult.then(array => {
    return array.map(i => new Information(i));
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
        .find({'deleted': {'$eq': true}})
        .toArray()
        .then(data => {
            return data.map(e => new Information(e));
        });
}

function getInformationCount(){
     return this.db.collection('information').count();
}

//Hide an Information for this user, afterwards it won't show up in his newsfeed anymore
function hideInformation(userID, informationID){
    return this.db.collection('information').findOne({ '_id' : ObjectId(informationID)})
    .then(i => {
      if(i){
        let info = new Information(i);
				//To handle cases where the field hiddenFor doesn't exist yet
        if(info.hiddenFor === undefined){
          info.hiddenFor = [];
        }
				//Add the user to the hiddenFor-Array
        info.hiddenFor.push(ObjectId(userID));
        let data = info.dbRepresentation;
				//Write the updated information to the database
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
