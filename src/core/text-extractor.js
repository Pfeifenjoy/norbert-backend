/**
 * @author: Tobias Dorra
 */

import {exec} from 'child_process';
import config  from '../utils/configuration';
import {Information} from './information';
import {forEachAsync} from '../utils/foreach-async';

const supportedFileExtensions = ['.pdf'];

/**
 * Returns the text from a document. 
 *
 * file_name is a string containing a path to a *.pdf file.
 */
var getDocumentText = function (file_name) {

    var p = new Promise((resolve, reject) => {
        console.log('     Running pdftotext for file ', file_name);
        let command = config.get('commands.pdftotext');
        exec([command, file_name, '-'].join(' '), (error, stdout, stderr) => {
            if (error) {
                if (error.code == 127) {
                    console.log('Could not extract text from a document.');
                    console.log('Please install \'pdftotext\' to be able to search for pdf documents');
                }
                console.log('     Failed executing \'pdftotext\'. Error code: ', error.code);
                resolve('');
            } else {
                resolve(stdout);
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

    files = files.filter(file => {
        let filename = file.originalFileName;
        return supportedFileExtensions
            .map(e => filename.endsWith(e))
            .reduce((a, b) => a || b);
    });

    let filesToText = forEachAsync(files, file => {
        console.log('     Downloading file: ', file.originalFileName);
        let tmpFile = file.getTemporary();

        let docText = tmpFile.then(obj => {
            return getDocumentText(obj.filename);
        });

        let cleanup = Promise.all([tmpFile, docText])
            .then(values => {
                console.log('     Cleaning up.');
                let [obj, text] = values;
                obj.unlink();
                return text;
            });
        return docText;
    });

    return filesToText.then(data => {
         let [ok, err] = data;
         let filesText = ok.join(' ');
         return [
             title + ' ' + tags,
             texts,
             filesText
         ];
    });
}

module.exports.extractText = extractText;

