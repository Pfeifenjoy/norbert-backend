/**
 * @author: Simon Oswald
 */
import {Entry} from './entry';

function getNewsfeed(userID){
    let query = {owned_by : userID};
    let entryCursor = this.db.collection('entries').find(query);
    let dbResult = entryCursor.toArray();
    let result = dbResult.then(array => {
        return array.map(e => new Entry(e));
    });

    return result;
}

export default {
    getNewsfeed
}

