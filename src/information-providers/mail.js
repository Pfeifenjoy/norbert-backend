import {ObjectID} from 'mongodb';
import {createComponent} from './../core/component';
import {Information} from './../core/information';
//import mail from './../../files/tmp/mail.json';
import fs from 'fs';
//import mailin from 'mailin';
const temp_file_path = './../../files/tmp/mail.json';


function checkForFile(path){

  var promise = fs.exists(path, (exists => {
    console.log(exists);
    if(!exists){
      fs.writeFile(path, '{}',(error => {
        if(error) console.log(error);
        console.log('Created file');
        })
      )}
  }));
  return promise;
};




var registerTriggers = function(trigger){
    var mailin = require('mailin');
    
        mailin.start({
          port: 1337,
          disableWebhook: true,
          requireAuthentication : false
        });

        /* Event emitted when a connection with the Mailin smtp server is initiated. */
        mailin.on('startMessage', function (connection) {
          console.log(connection);
        });

        /* Event emitted after a message was received and parsed. */
        mailin.on('message', function (connection, data, content) {
            /*mails.push(data);
            fs.writeFile(temp_file_path, JSON.stringify(mails,null,4),err => {
                if (err) console.log(err);
                console.log('Updated file');
                }
            )*/
            console.log(data);
        });

        mailin.on('error', function(error){
          console.error(error);
        });
    //})
}


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
        "sync": sync,
        "registerTriggers" : registerTriggers
    }
};