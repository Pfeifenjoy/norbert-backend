import {ObjectID} from 'mongodb';
import {createComponent} from './../core/component';
import {Information} from './../core/information';
//import mailin from 'mailin';



var sync = function(infoManager){
    //doesnt work yet
    
    let toInsert = [];
    // Create a description component and fill it with some text.
    /*mails.forEach(mail => {
    let desc = createComponent('components-description');
    desc.text = mail.text;

    // Add it to a new Information
    let info = new Information();
    info.title = "Mail from " + mail.connection.envelopeFrom.address + " Subject : "  +  mail.subject;
    info.components = [
        desc
    ];
    toInsert.push(info);
    })*/

    if(toInsert.length == 0){
        // Always return a promise!
        return Promise.resolve();
      }
    else{
    // Insert the Information into the database.
     var promise = infoManager.insert(toInsert);
    // Always return a promise!

    toInsert = [];
    mails = [];
    return promise;
    }
    


}



module.exports = {
	"pluginName": "info-provider-mail",
    "pluginObject": {
        "sync": sync
    }
};