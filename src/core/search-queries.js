/**
 * @author Simon Oswald
 */
 import { Entry } from "./entry";
 import { Information} from "./information";

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
 function search(keywords, user){
 	var promises = [this.searchEntries(keywords,user),this.searchInformation(keywords,user)];
 	return Promise.all(promises)
 	.then(([a, b]) => a.concat(b))
 	.then(sortRelevance)
 	.then(userRepresentation);
 }

 function searchEntries(keywords,user){
 	let userID = user.id;
 	let query =  { 
 		owned_by : userID , 
 		tags: { 
 			'$in': keywords
 			}
 		};
   	let entryCursor = this.db.collection('entries').find(query);
   	console.log("hier");
   	let dbResult = entryCursor.toArray();
   	let result = dbResult.then(array => {
       return array
       .filter(e => !e.deleted)
       .map(e => new Entry(e));
   	});
   	return result;
 }

 function searchInformation(keywords,user){
 	let query = {
 		hidden_for : {
 			$ne : user.id
 		}, 
 		tags: { 
 			'$in' : keywords
 		}
 	};
 let InformationCursor = this.db.collection('information').find(query);
 	let dbResult = InformationCursor.toArray();
 	let result = dbResult.then(array => {
     return array
     .filter(i => !i.deleted)
     .map(i => new Information(i));
   });
   return result;
 }

 module.exports.search = search;
 module.exports.searchInformation = searchInformation;
 module.exports.searchEntries = searchEntries;
