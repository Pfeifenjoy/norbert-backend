
function createUser(username, password) {
	return this.db.collection("users").insertOne({
        username, password
    });
}

module.exports.createUser = createUser;