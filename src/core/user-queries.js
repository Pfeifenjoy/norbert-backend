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

function updateUser(userSession, user){
	var toSet = {};
	if(user.password_new && user.password_old){
		this.authUser(userSession.username, user.password_old)
		.then(() => {
			user.password_new = hashPassword(user.password_new);
        	toSet.password = user.password_new;
        })
        .catch(e => {
        	console.log('Password and Username did not match')
        })
	 	
    }
    if(user.name) toSet.name = user.name;
    var setObj = { $set : toSet}
	return this.db.collection("users").updateOne({"username":userSession.username }, setObj);
}

function deleteUser(userId){
	console.log(userId);
	return this.db.collection("users").remove({"username":userId});
}

function authUser(username, password){
	password = hashPassword(password);
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
