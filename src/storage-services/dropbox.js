/*
 * @author: Philipp Pütz
 */
import {
    spawn
} from 'child_process';
import fs from 'fs';
import config from '../utils/configuration.js';
import https from 'https';


const contentUrl = "content.dropboxapi.com";

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
        let remoteFile = {
            "path": remoteFileName
        };

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

    // Get token from config
    let token = config.get("dropbox.oAuthToken");

    // Concat id with the dropbox "id" prefix
    let fileID = "id:" + remoteFile.id;

    // download the File and save it
    return downloadFile(fileID, localFile, token);
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
    const dropboxHomeUrl = "www.dropbox.com/home";

    // Extract filename 
    let filename = remoteFile.path.substring(remoteFile.path.lastIndexOf("/") + 1);

    // Extract path
    let filepath = remoteFile.path.substring(0, remoteFile.path.lastIndexOf("/"));

    return dropboxHomeUrl + filepath + "?preview=" + filename;
}

module.exports = {
    'pluginName': 'storage-dropbox',
    'pluginObject': {
        'upload': upload,
        'download': download,
        'getUrl': getUrl
    }
};



// Dropbox APIv2 

/* downloadFile
 *
 * needs: [id]: of the file, 
 *        [localFilePath]: path with filename, indicates where to store the file
 *        [token]: oAuth token for dropbox authentication
 * returns: promise
 */
let downloadFile = (fileID, localFilePath, token) => {

    const pathUrl = "/2/files/download";

    // HTTP body
    let headerPath = JSON.stringify({
        "path": fileID
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: contentUrl,
        path: pathUrl,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Dropbox-API-Arg': headerPath
        }
    };

    return new Promise((resolve, reject) => {
        // Set up the request
        var req = https.request(post_options, (res) => {

            let data = [];

            res.on('data', (chunk) => {
                // Add the raw data chunks
                data.push(chunk);
            });

            res.on('end', () => {

                if (res.statusCode === 200) {

                    // Get response Header
                    let responseDropboxApi = JSON.parse(res.headers["dropbox-api-result"]);

                    // Concat alle the raw chunks to a complete file
                    let fileData = Buffer.concat(data);

                    fs.writeFile(localFilePath, fileData, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });

                } else {
                    reject("HTTP-Error:" + res.statusCode);
                }
            });

        });

        req.on('error', (e) => {
            reject(e);
        });

        // Fire the http request
        req.end();
    });
}
