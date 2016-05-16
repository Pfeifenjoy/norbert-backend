/**
 * @author Simon Oswald, Arwed Mett
 *
 * These functions are used to create, edit, delete or authenticate users
 */
import crypto from "crypto";


function createUser(username, name, password) {
    password = hashPassword(password);
    return this.db.collection("users").insertOne({username, name, password});

}

//Ensure that the username is used as an unique key
function initUserCollection( ){
	this.db.collection("users").createIndex( { "username": 1 }, { unique: true } );
	console.log("Created Unique Key");
};

function updateUser(username, password_new){
	password_new = hashPassword(password_new);
	return this.db.collection("users").update({"username" : username}, {$set : {"password" : password_new}} );
}

function deleteUser(username){
	return this.db.collection("users").remove({"username":username});
}

//Check if the supplied password and username are linked to a valid user
function authUser(username, password){
	password = hashPassword(password);
	return this.db.collection("users").findOne({"username":username, "password" : password });
}

//Since we don't want so store passwords in plain text, we hash them
function hashPassword(password){
	return crypto.createHash("md5").update(password).digest("hex");
}
module.exports.initUserCollection = initUserCollection;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.authUser = authUser;
