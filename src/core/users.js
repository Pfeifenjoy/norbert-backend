/*
	@author Simon Oswald, Arwed Mett
*/
import crypto from "crypto";




function createUser(username, name, password) {
    password = crypto.createHash("md5")
        .update(password)
        .digest("hex");
    return this.db.collection("users").insertOne({username, name, password});

}

function initUserCollection( ){
	this.db.collection("users").createIndex( { "username": 1 }, { unique: true } );
	console.log("Created Unique Key");
};

function updateUser(userId, user){
	var toSet = {};
	if(user.password){
	 	user.password = crypto.createHash("md5")
        .update(user.password)
        .digest("hex");
        toSet.password = user.password;
    }
    if(user.username) toSet.username = user.username;
    if(user.name) toSet.name = user.name;
    var setObj = { $set : toSet}
	return this.db.collection("users").updateOne({"username":userId }, setObj);
}
module.exports.initUserCollection = initUserCollection;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
