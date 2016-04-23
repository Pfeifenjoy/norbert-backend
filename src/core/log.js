import {Information} from 'information';
import {Entry} from 'entries';

function log(action, object, db){
    let timeStamp = Date.now();
    let type;
    if (object instanceof Entry) {
        type = 'entry';
    } else if (object instanceof Information) {
        type = 'information';
    } else {
        throw 'The given object must either be an Entry or an Information.'
    }
    let id = object.id;

    return db.collection('log').insert({
        timestamp: timeStamp, 
        type: type,
        document: id,
        action: action
    });
}

module.exports.logCreated = function(object){return log('created', object, this.db);};
module.exports.logUpdated = function(object){return log('updated', object, this.db);};
module.exports.logDeleted = function(object){return log('deleted', object, this.db);};
