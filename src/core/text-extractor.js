/**
 * @author: Tobias Dorra
 */

import {spawn} from 'child_process'

var getDocumentText = function (file_name) {

    var p = new Promise((resolve, reject) => {
        let text = '';
        let process = spawn('pdftotext', [file_name, '-']);
        
        process.stdout.on('data', (data) => {
            text = text + data;
        });
        
        process.on('close', (code) => {
            if (code == 0) {
                resolve(text);
            } else if (code == 127) {
                console.log('Could not extract text from a document.');
                console.log('Please install \'pdftotext\' to be able to search for pdf documents');
                reject(code);
            } else {
                reject(code);
            }
        });
   
    });
    return p;
}

var extractText = function(entry) {
    let result = {
        '0': '',    // titel & tags
        '1': '',    // inline text
        '2': ''     // text from documents
    };

    
    let title = entry.title || '';
    // TODO: Tags

    let texts = '';
    let files = [];

    for (component of entry.components) {
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
        let cleanup = Promise.all([tmpFile, after(docText)])
            .then(values => {
                let [obj, text] = values;
                obj.unlink();
                return text;
            });
        return cleanup;
    });



    
}

