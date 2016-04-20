/*
	@author Simon Oswald, Arwed Mett
*/
import crypto from "crypto";




function createUser(username, name, password) {
    password = hashPassword(password);
    return this.db.collection("users").insertOne({username, name, password});

}

function initUserCollection( ){
	this.db.collection("users").createIndex( { "username": 1 }, { unique: true } );
	console.log("Created Unique Key");
};

function updateUser(userId, user){
	var toSet = {};
	if(user.password){
	 	user.password = hashPassword(user.password);
        toSet.password = user.password;
    }
    if(user.username) toSet.username = user.username;
    if(user.name) toSet.name = user.name;
    var setObj = { $set : toSet}
	return this.db.collection("users").updateOne({"username":userId }, setObj);
}

function deleteUser(userId){
	console.log(userId);
	return this.db.collection("users").remove({"username":userId});
}

function authUser(username, password){
	password = crypto.createHash("md5").update(password).digest("hex");
	console.log(username, password);
	return this.db.collection("users").findOne({"username":username});
}

function hashPassword(password){
	return crypto.createHash("md5").update(password).digest("hex");
}
module.exports.initUserCollection = initUserCollection;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.authUser = authUser;
