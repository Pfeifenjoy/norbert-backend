/**
 * @author: Simon Oswald
 */

export function getNewsfeed(userID){
    return this.db.collection("entries").find({owned_by : userID});
}