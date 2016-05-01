/*
 *
 **/
import ObjectID from 'mongodb';
import createComponent from './../core/component';
import Information from './../core/information';
import fs from 'fs';

const temp_file_path = './files/tmp/mail.json';

let emails = {
    emails: []
}

let registerTriggers = (trigger) => {

    // get mail module
    var mailin = require('mailin');

    // start mail server
    mailin.start({
        port: 1337,
        disableWebhook: true,
        requireAuthentication: false
    });

    /* Event emitted when a connection with the Mailin smtp server is initiated. */
    mailin.on('startMessage', function(connection) {
        //console.log(connection);
    });

    /* Event emitted after a message was received and parsed. */
    mailin.on('message', function(connection, mail, content) {

        let subject = (mail.subject === undefined) ? "" : mail.subject;
        let text = (mail.text === undefined) ? "" : mail.text;

        let newMail = {
            subject: subject,
            text: text,
            sender: mail.envelopeFrom.address,
            time: Date.now()
        };

        // Check if file exists
        fs.stat(temp_file_path, function(err, stat) {
            if (err == null) {

                // File exists so read file
                fs.readFile(temp_file_path, (err, data) => {
                    if (err) throw err;
                    emails = JSON.parse(data);

                    // Update json
                    emails["emails"].push(newMail);

                    // write File again
                    fs.writeFile(temp_file_path, JSON.stringify(emails));
                });

            } else if (err.code == 'ENOENT') {
                // File didn't exists so create it!

                emails["emails"].push(newMail);

                fs.writeFile(temp_file_path, JSON.stringify(emails));
            } else {
                console.log('Writing file failed: ', err.code);
            }
        });

    });

    mailin.on('error', function(error) {
        console.error(error);
    });
}

let processMails = (newMails, infoManager) => {

    let sync = Promise.resolve();

    newMails.forEach(mail => {
        sync = sync.then(() => {
            console.log("err");
            let desc = createComponent('components-description');
            desc.text = mail.text;
            console.log("err2");

            let info = new Information();
            info.title = "Mail von " + mail.sender + " -- Betreff: " + mail.subject;

            console.log("Mail von " + mail.sender + " -- Betreff: " + mail.subject);

            info.components = [
                desc
            ];

            return infoManager.insert(info);
        });
    });

    return sync;
};

var sync = function(infoManager) {

    console.log(" - Mailserver -");
    // Check if file exists

    return new Promise((resolve, reject) => {
        fs.stat(temp_file_path, function(err, stat) {
            if (err == null) {
                console.log("Mailserver: Reading arrived mails.");
                // File exists so read file

                fs.readFile(temp_file_path, (err, data) => {
                    let newMails = JSON.parse(data)["emails"];

                    // delete file
                    fs.unlink(temp_file_path);

                    console.log("Mailserver: Processing " + newMails.length + " new email(s).");

                    if (newMails.length > 0) {
                        processMails(newMails, infoManager).then(() => {
                            console.log("Mailserver: Done with processing new emails.");
                            resolve();
                        }).catch(err => {
                            console.log(err);
                            reject("Mailserver: Processing error");
                        });
                    }

                });

            } else if (err.code == 'ENOENT') {
                console.log("Mailserver: No new mails available.");
                // File didn't exists => Nothing to do!
                resolve();
            } else {
                console.log('Writing file failed: ', err.code);
                reject("Mailserver: Writing file failed.");
            }
        });
    });
}

module.exports = {
    "pluginName": "info-provider-mail",
    "pluginObject": {
        "sync": sync,
        "registerTriggers": registerTriggers
    }
};