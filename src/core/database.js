var mongo = require('mongodb');
var config = require('./../configuration.js');
var promisify = require('./../utils/promisify.js');

var database = null;

var connect = function(){
	var url = config.get('database.url');
	var promise = promisify();
	mongo.MongoClient.connect(url, promise.callback);
	return promise;
};

module.exports = {
	"connect": connect,
	"handle": database
};