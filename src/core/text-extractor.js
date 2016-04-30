/**
 * @author: Tobias Dorra
 */

import {spawn} from 'child_process';
import config  from '../utils/configuration';
import {Information} from './information';

/**
 * Returns the text from a document. 
 *
 * file_name is a string containing a path to a *.pdf file.
 */
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
                // Wasn't *.pfd most likely.
                resolve('');
            }
        });
   
    });
    return p;
}

/**
 * Returns all text from an entry or an information.
 *
 * The result is an array, consisting out of three elements.
 * result[0] : Important text like headlines or tags.
 * result[1] : Normal text.
 * result[2] : Text that is only loosely related to the Entry or Information.
 */
var extractText = function(entry) {

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
        texts = texts + ' ' + compText;
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

    return Promise.all(filesToText).then(docTexts => {
        let docText = docTexts.join(' ');

        return [
             title + ' ' + tags,
             texts,
             docText
        ];
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
            return extractText(info);
        }).then(text => {
            console.log('Text: ', text);
        });
}

module.exports.testMe = testMe;

