import {ObjectID} from 'mongodb';

module.exports = {
	"sync": function(infoManager){
		return Promise.resolve()
			.then(() => {
				return infoManager.insert({
					"title": "Hallo Welt!"
				});
			});
	}
};