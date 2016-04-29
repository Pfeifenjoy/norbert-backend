/**
 * @author: Tobias Dorra
 */

import {spawn} from 'child_process';
import config  from '../utils/configuration';
import {Information} from './information';

var getDocumentText = function (file_name) {

    var p = new Promise((resolve, reject) => {
        let text = '';
        let command = config.get('commands.pdftotext');
        let process = spawn(command, [file_name, '-']);
        
        process.stdout.on('data', (data) => {
            text = text + data;
        });
        
        process.on('close', (code) => {
            if (code == 0) {
                resolve(text);
            } else if (code == 127) {
                console.log('Could not extract text from a document.');
                console.log('Please install \'pdftotext\' to be able to search for pdf documents');
                resolve('');
            } else {
                resolve('');
            }
        });
   
    });
    return p;
}

var extractText = function(entry) {

    console.log(entry);

    let title = entry.title || '';
    let tags = '';
    if (entry.tags) {
        tags = entry.tags.join(' ');
    }

    let texts = '';
    let files = [];

    for (let component of entry.components) {
        let compText = component.getText();
        let compFiles = component.getFiles();
        texts = texts + compText;
        files = files.concat(compFiles);
    }

    let filesToText = files.map(file => {
        let tmpFile = file.getTemporary();
        let docText = tmpFile
            .then(obj => {
                return getDocumentText(obj.filename);
            });
        let cleanup = Promise.all([tmpFile, docText])
            .then(values => {
                let [obj, text] = values;
                obj.unlink();
                return text;
            });
        return docText;
    });

    return Promise.all(filesToText).then(texts => {
        let docText = texts.join(' ');

        // the result is weighted (hacky, I know)
        let result = [title, title, title, title
                    , tags , tags , tags , tags
                    , texts, texts
                    , docText].join(' ');
        return result;
    });
}


function testMe() {

    return this.db.collection('information')
        .find({})
        .limit(10)
        .toArray()
        .then(data => {
            let rawInfo = data[1];
            let info = new Information(rawInfo);
            //console.log('Info: ', data);
            return extractText(info);
        }).then(text => {
            console.log('Text: ', text);
        });
}

module.exports.testMe = testMe;


