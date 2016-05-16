/**
 * @author Simon Oswald
 *
 * These functions are used to implement a simple tag based search
 */
 import { Entry } from "./entry";
 import { Information} from "./information";

//Get the relevance of an Entry/Information, the closer to the current date, the more relevant
function getRelevance(newsfeedObject) {
    return [newsfeedObject.createdAt]
    .concat(newsfeedObject.components
     .filter(c => { return c && c.type === "components-notification" })
     .map(c => c.data.date)
    )
    .map(time => Math.abs(Date.now() - time))
    .reduce((a, b) => Math.min(a, b))
}

//Sort a list of Entries/Information according to their relevance
function sortRelevance(objects) {
    return objects.sort((a, b) => {
        return getRelevance(a) - getRelevance(b);
    })
}

function userRepresentation(objects) {
    return objects.map(object => object.userRepresentation);
}

//Search the tags of Entries and Information for matches with the keywords
function search(keywords, user){
	var promises = [this.searchEntries(keywords,user),this.searchInformation(keywords,user)];
  //Merge the 2 functions-calls into one Promise
	return Promise.all(promises)
  //Merge the arrays
	.then(([a, b]) => a.concat(b))
	.then(sortRelevance)
	.then(userRepresentation);
}

function searchEntries(keywords,user){
	let userID = user.id;
	let query =  {
		owned_by : userID , //Only return Entries owned by the User
		tags: {
			'$in': keywords //Matches all entries, where one or more tags match one or mor keywords
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
			$ne : user.id //Only return Information that the user didn't delete
		},
		tags: {
			'$in' : keywords //Matches all entries, where one or more tags match one or mor keywords
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
