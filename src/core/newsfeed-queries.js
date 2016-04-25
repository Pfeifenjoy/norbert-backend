/**
 * @author: Simon Oswald
 */

function getNewsfeed(userID){
    return this.db.collection("entries").find({owned_by : userID});
}

export default {
    getNewsfeed
}

