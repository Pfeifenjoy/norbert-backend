import crypto from "crypto";

function createUser(username, password) {

    password = crypto.createHash("md5")
        .update(password)
        .digest("hex")
	return this.db.collection("users").insertOne({
        username, password
    });
}

module.exports.createUser = createUser;
