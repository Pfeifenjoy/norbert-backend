/**
 * @author Simon Oswald, Arwed Mett
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

function updateUser(username, password_new){
	password_new = hashPassword(password_new);
	return this.db.collection("users").update({"username" : username}, {$set : {"password" : password_new}} );
}

function deleteUser(username){
	console.log(userId);
	return this.db.collection("users").remove({"username":username});
}

function authUser(username, password){
	password = hashPassword(password);
	console.log(password);
	return this.db.collection("users").findOne({"username":username, "password" : password });
}

function hashPassword(password){
	return crypto.createHash("md5").update(password).digest("hex");
}
module.exports.initUserCollection = initUserCollection;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.authUser = authUser;
