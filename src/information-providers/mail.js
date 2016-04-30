import {ObjectID} from 'mongodb';
import {createComponent} from './../core/component';
import {Information} from './../core/information';
//import mailin from 'mailin';

var mails = [];

var mailin = require('mailin');
/* Start the Mailin server. The available options are:
 *  options = {
 *     port: 25,
 *     webhook: 'http://mydomain.com/mailin/incoming,
 *     disableWebhook: false,
 *     logFile: '/some/local/path',
 *     logLevel: 'warn', // One of silly, info, debug, warn, error
 *     smtpOptions: { // Set of options directly passed to simplesmtp.createServer(smtpOptions)
 *        SMTPBanner: 'Hi from a custom Mailin instance',
 *        // By default, the DNS validation of the sender and recipient domains is disabled so.
 *        // You can enable it as follows:
 *        disableDNSValidation: false
 *     }
 *  };
 * Here disable the webhook posting so that you can do what you want with the
 * parsed message. */
mailin.start({
  port: 1337,
  disableWebhook: true,
  requireAuthentication : false
   // Disable the webhook posting.
});

/* Access simplesmtp server instance. */
/*mailin.on('authorizeUser', function(connection, username, password, done) {
  if (username == "johnsmith" && password == "mysecret") {
    done(null, true);
  } else {
    done(new Error("Unauthorized!"), false);
  }
});
*/
/* Event emitted when a connection with the Mailin smtp server is initiated. */
mailin.on('startMessage', function (connection) {
  /* connection = {
      from: 'sender@somedomain.com',
      to: 'someaddress@yourdomain.com',
      id: 't84h5ugf',
      authentication: { username: null, authenticated: false, status: 'NORMAL' }
    }
  }; */
  console.log(connection);
});

/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {
  console.log(data);
  mails.push(data);
  /* Do something useful with the parsed message here.
   * Use parsed message `data` directly or use raw message `content`. */
});

mailin.on('error', function(error){
  console.error(error);
})

var sync = function(infoManager){
    //doesnt work yet
    /*
    let toInsert = [];
    // Create a description component and fill it with some text.
    mails.forEach(mail => {


    let desc = createComponent('components-description');
    desc.text = mail.text;

    // Add it to a new Information
    let info = new Information();
    info.title = "Mail from " + mail.connection.envelopeFrom.address + " Subject : "  +  mail.subject;
    info.components = [
        desc
    ];
    toInsert.push(info);
    })


    // Insert the Information into the database.
     var promise = infoManager.insert(toInsert);
    // Always return a promise!

    toInsert = [];
    mails = [];
    return promise;
    */
    
    //Dummy code
    // Create a description component and fill it with some text.
    let desc = createComponent('components-description');
    desc.text = "Ich bin eine Beschreibung!";

    // Add it to a new Information
    let info = new Information();
    info.title = "Hallo Universum!";
    info.components = [
        desc
    ];

    // Insert the Information into the database.
    let promise = infoManager.insert(info);

    // Always return a promise!
    return promise;
}



module.exports = {
	"pluginName": "info-provider-mail",
    "pluginObject": {
        "sync": sync
    }
};