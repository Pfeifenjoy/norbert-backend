/**
 * @author: Tobias Dorra
 */

import {spawn} from 'child_process';
import fs from 'fs';

/**
 * Uploads a file to the storage provider.
 *
 * localFile: The path to the file to upload.
 *
 * originalFileName: The name that was given to 
 *          the file by the user. A filename similar 
 *          to this should be chosen on the Storage,
 *          to create a good UX.
 *          The Storage Service is totally free to 
 *          modify the given file name, but at least
 *          the extension should be preserved.
 * 
 * returns: A promise that gets resolved with
 *          the result object when the upload 
 *          is finished.
 *
 * result:  An object representing the file on the
 *          remote location. It contains all information 
 *          that the Storage Service needs to find it again.
 *          The structure of the object is completely up to the
 *          Storage Service.
 */
function upload(localFile, originalFileName) {

    // "upload" needs to return a promise.
    return new Promise((resolve, reject) => {

        // fake-upload the file
        // (we completely ignore the parameter 'originalFileName' here.)
        let remoteFileName = './files/' + Date.now().toString();
        let remoteFile = {"path": remoteFileName};

        let process = spawn('cp', [localFile, remoteFileName]);
        
        // when finished resolve with the "uploaded" location.
        process.on('close', (code) => {
            if (code == 0) {
                resolve(remoteFile);
            } else {
                reject(code);
            }
        });
   
    });

}

/**
 * Downloads a file that is stored by this Storage Provider
 * to the local hard drive.
 *
 * remoteFile: Points to the file to be downloaded. This
 *             is actually an Object that was the result
 *             of a call to "upload".
 *
 * localFile: The destination path on the local harddrive.
 *
 * returns: A Promise, that is resolved once the download
 *             is complete.
 */
function download(remoteFile, localFile) {
    
    // "download" needs to return a promise.
    return new Promise((resolve, reject) => {

        // fake-upload the file
        let remoteFileName = remoteFile.path;
        let process = spawn('cp', [remoteFileName, localFile]);
        
        // when finished resolve the Promise.
        process.on('close', (code) => {
            if (code == 0) {
                resolve();
            } else {
                reject(code);
            }
        });
   
    });

}

/**
 * Creates an URL that can be used by the user to
 * download/view the file from the storage provider.
 *
 * remoteFile: The requested file.
 *
 * returns: A string with the URL where the requested
 *          file can be viewed/downloaded from.
 */
function getUrl(remoteFile) {
    
    // build a data-url for the file.
	var data = fs.readFileSync(remoteFile.path).toString('base64');
    return 'data:application;base64,' + data;
}

module.exports = {
    'pluginName'  : 'storage-demo',
    'pluginObject': {
        'upload': upload,
        'download': download,
        'getUrl': getUrl
    }
};
