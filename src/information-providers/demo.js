import {ObjectID} from 'mongodb';

var sync =  function(infoManager){

	return infoManager.insert({
		"title": "Hallo Welt!"
	});
}

module.exports = {
	"pluginName": "info-provider-demo",
	"sync": sync
};