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

function findDirtyInformation(){
    return this.db.collection("information")
        .find({'dirty': true, 'deleted': false})
        .toArray()
        .then(data => {
            return data.map(e => new Information(e));
        });
}

function findDeletedInformation(){
    return this.db.collection("information")
        .find({'dirty': true, 'deleted': true})
        .toArray()
        .then(data => {
            return data.map(e => new Information(e));
        });
}

function getInformationCount(){
     return this.db.collection('information').count();
}

module.exports.getInformation = getInformation;
module.exports.findDirtyInformation = findDirtyInformation;
module.exports.findDeletedInformation = findDeletedInformation;
module.exports.getInformationCount = getInformationCount;

