/*
 * @author: Philipp Pütz
 */
import {
    spawn
} from 'child_process';
import fs from 'fs';
import config from '../utils/configuration.js';
import https from 'https';
import querystring from 'querystring';
import { File } from "./../core/file";


const contentUrl = "content.dropboxapi.com";

let MAX_BYTES_PER_UPLOAD = 150 * 1024 * 1024; // 150 MB
let CHUNK_SIZE = 1 * 1024 * 1024; // 1MB

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

    // Get token from config
    let token = config.get("dropbox.oAuthToken");

    if (token === undefined) {
        throw "There is an error in the config file: Setting dropbox.oAuthToken is required!";
    }

    // Get uploadFolder from config
    let uploadFolder = config.get("dropbox.storagePath");

    if (uploadFolder === undefined) {
        throw "There is an error in the config file: Setting dropbox.storagePath is required!";
    }

    return uploadFile(originalFileName, localFile, token, uploadFolder)
    .then(dropboxObject => {

        // Extract id
        let id = dropboxObject["id"].substring(dropboxObject["id"].lastIndexOf(":") + 1);

        // Object with some important information
        let fileObject = {
            "id": id,
            "rev": dropboxObject.rev,
            "path": dropboxObject.path_display,
        }

        // Extract filename
        let filename = dropboxObject["name"];

        // Create new file
        let myFile = new File();
        // set location of the file
        myFile.setToRemoteFile(fileObject, filename);

        return myFile;
    })
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

    if (token === undefined) {
        throw "There is an error in the config file: Setting dropbox.oAuthToken is required!";
    }

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
    console.log("hier", remoteFile);
    console.log(remoteFile);
    let filename = remoteFile.path.substring(remoteFile.path.lastIndexOf("/") + 1);
    console.log("hier");

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

/* uploadFile
 *
 * needs: [fileName]: name of the file with extension
 *        [filePath]: local path to the file
 *        [token]: oAuth token
 *        [uploadFolder]: path where the service can store the file
 * returns [fileObject] from dropbox
 */

let uploadFile = (fileName, filePath, token, uploadFolder) => {

    let stats = fs.statSync(filePath);
    let fileSizeInBytes = stats["size"];

    // Check if file size is geater then 150MB
    if (fileSizeInBytes <= MAX_BYTES_PER_UPLOAD) {
        return singleRequestUpload(fileName, filePath, token, uploadFolder);
    } else {
        return multiRequestUpload(fileName, filePath, fileSizeInBytes, token, uploadFolder);
    }
}



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

                    // Concat all the raw chunks to a complete file
                    let fileData = Buffer.concat(data);

                    // Save the file to local path
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

/* singleRequestUpload => use this for files < 150 MB
 * needs: [fileName]: name of the file with extension
 *        [filePath]: local path to the file
 *        [token]: oAuth token
 *        [uploadFolder]: path where the service can store the file
 * returns: [fileObject]: from dropbox if response is OK
 */
let singleRequestUpload = (fileName, filePath, token, uploadFolder) => {

    const pathUrl = "/2/files/upload";

    // HTTP-Header
    let headerOptions = JSON.stringify({
        "path": uploadFolder + "/" + fileName,
        "mode": "add",
        "autorename": true,
        "mute": true
    });

    // An object of options to indicate where to post to
    let post_options = {
        host: contentUrl,
        path: pathUrl,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': headerOptions
        }
    };

    return new Promise((resolve, reject) => {
        // Set up the request
        let req = https.request(post_options, (res) => {

            var data = "";
            res.on('data', (chunk) => {
                // Add the data chunks
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode == 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject("Dropbox: Upload error:" + JSON.parse(data));
                }

            });

        });

        req.on('error', (e) => {
            reject(e);
        });

        // Buffers the actual chunk of the file
        let buffer = new Buffer(CHUNK_SIZE);

        fs.open(filePath, 'r', function(err, fd) {
            if (err) throw err;

            function readNextChunk() {
                fs.read(fd, buffer, 0, CHUNK_SIZE, null, function(err, bytesRead) {

                    if (err) throw err;

                    if (bytesRead === 0) {
                        // done reading file
                        req.end();

                        fs.close(fd, function(err) {
                            if (err) throw err;
                        });
                        return;
                    }

                    var data;
                    if (bytesRead < CHUNK_SIZE) {
                        // slice buffer if there is less data to upload then chunk size
                        data = buffer.slice(0, bytesRead);
                    } else {
                        // upload the whole buffer
                        data = buffer;
                    }

                    // Upload the data
                    req.write(data, () => {
                        readNextChunk();
                    });


                });
            }

            // Start upload
            readNextChunk();
        });
    });
}

/* multiRequestUpload => use this for files > 150 MB
 * needs: [fileName]: name of the file with extension
 *        [filePath]: local path to the file
 *        [token]: oAuth token
 *        [uploadFolder]: path where the service can store the file
 * returns: [fileObject]: from dropbox if response is OK
 */
let multiRequestUpload = (fileName, filePath, fileSizeInBytes, token, uploadFolder) => {

    // Start uploading the large file
    return multiRequestUploadStart(fileName, filePath, token).then(data => {

        let session_id = data.id;
        let readedBytes = data.readedBytes;

        // local function
        function uploadMore() {
            // append chunks to the uploaded chunks
            return multiRequestUploadAppend(fileName, filePath, token, readedBytes, session_id).then(data => {
                readedBytes = data;
                // Upload all other bytes from the file until the last chunk is smaller then 150 MB
                if (fileSizeInBytes - readedBytes > MAX_BYTES_PER_UPLOAD) return uploadMore();
                else {
                    // Finish the upload
                    return multiRequestUploadFinish(fileName, filePath, token, uploadFolder, readedBytes, session_id);
                }
            });
        }

        // Upload all other bytes from the file until the last chunk is smaller then 150 MB
        if (fileSizeInBytes - readedBytes > MAX_BYTES_PER_UPLOAD) return uploadMore();

        else {
            // Finish the upload
            return multiRequestUploadFinish(fileName, filePath, token, uploadFolder, readedBytes, session_id);
        }
    });
}


/* multiRequestUploadStart
 *
 * needs: [fileName]: name of the file with file extension
 *        [filePath]: local path to the file
 *        [token]: OAuth access token
 * returns [id]: for further uploads 
 *         [readedBytes]: uploaded bytes;
 *         in an json object if response is OK
 */
let multiRequestUploadStart = (fileName, filePath, token) => {

    const pathUrl = "/2/files/upload_session/start";

    var readedBytes = 0;

    // HTTP-Header
    var headerOptions = JSON.stringify({
        "close": false
    });

    // An object of options to indicate where to post to
    var post_options_start = {
        host: contentUrl,
        path: pathUrl,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': headerOptions
        }
    };

    return new Promise((resolve, reject) => {
        // Set up the request
        let req = https.request(post_options_start, (res) => {

            let data = "";
            res.on('data', (chunk) => {
                // Add the data chunks
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    let response = JSON.parse(data);
                    resolve({
                        id: response["session_id"],
                        readedBytes: readedBytes
                    });
                } else {
                    reject("Dropbox: Upload error: " + response);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        // Buffers the actual chunk of the file
        let buffer = new Buffer(CHUNK_SIZE);

        // Open file
        fs.open(filePath, 'r', function(err, fd) {
            // throw error is something bad happens...
            if (err) throw err;

            // local function
            function readNextChunk() {
                fs.read(fd, buffer, 0, CHUNK_SIZE, readedBytes, function(err, bytesRead) {
                    if (err) throw err;

                    // check if there is more data to upload
                    if (bytesRead === 0 || readedBytes + CHUNK_SIZE > MAX_BYTES_PER_UPLOAD) { // 150MB
                        // done reading
                        req.end();

                        fs.close(fd, function(err) {
                            if (err) throw err;
                        });
                        return;
                    }
                    // update readedBytes
                    readedBytes += bytesRead;

                    var data;
                    if (bytesRead < CHUNK_SIZE) {
                        // slice buffer if there is less data to upload then chunk size
                        data = buffer.slice(0, bytesRead);
                    } else {
                        // upload the whole buffer
                        data = buffer;
                    }

                    // upload the buffer
                    req.write(data, () => {
                        // read next chunk and upload it
                        readNextChunk();
                    });
                });
            }
            // Start upload!
            readNextChunk();
        });
    });

}

/* multiRequestUploadAppend
 * needs: [fileName]: name of the file with file extension
 *        [filePath]: local path to the file
 *        [token]: OAuth access token
 *        [readedBytes]: so far uploaded bytes
 *        [session_id]: actual upload session id
 * returns [readedBytes]: uploaded bytes;
 */
let multiRequestUploadAppend = (fileName, filePath, token, readedBytes, session_id) => {

    const pathUrl = "/2/files/upload_session/append_v2";

    // HTTP-Header Options
    let headerOptions = JSON.stringify({
        "cursor": {
            "session_id": session_id,
            "offset": readedBytes
        },
        "close": false
    });

    // An object of options to indicate where to post to
    var post_options_start = {
        host: contentUrl,
        path: pathUrl,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': headerOptions
        }
    };

    return new Promise((resolve, reject) => {
        // Set up the request
        var req = https.request(post_options_start, (res) => {

            var data = "";
            res.on('data', (chunk) => {
                // Add the data chunks
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200)
                    resolve(readedBytes);
                else reject(JSON.parse(data));
            });

        });

        req.on('error', (e) => {
            reject(e);
        });

        // local counter for the uploaded bytes
        let uploadedBytes = 0;

        // Buffers the actual chunk of the file
        let buffer = new Buffer(CHUNK_SIZE);

        fs.open(filePath, 'r', function(err, fd) {
            if (err) throw err;

            function readNextChunk() {
                fs.read(fd, buffer, 0, CHUNK_SIZE, readedBytes, function(err, bytesRead) {
                    if (err) throw err;

                    if (bytesRead === 0 || uploadedBytes + CHUNK_SIZE > MAX_BYTES_PER_UPLOAD) { // 150MB
                        // done reading
                        req.end();

                        fs.close(fd, function(err) {
                            if (err) throw err;
                        });
                        return;
                    }

                    // Update counters
                    readedBytes += bytesRead;
                    uploadedBytes += bytesRead;

                    var data;
                    if (bytesRead < CHUNK_SIZE) {
                        // slice buffer if there is less data to upload then chunk size
                        data = buffer.slice(0, bytesRead);
                    } else {
                        // upload the whole buffer
                        data = buffer;
                    }

                    req.write(data, () => {
                        // Uplode more...
                        readNextChunk();
                    });


                });
            }
            // Start upload
            readNextChunk();
        });
    });
}

/* multiRequestUploadFinish
 * needs: [fileName]: name of the file with file extension
 *        [filePath]: local path to the file
 *        [token]: OAuth access token
 *        [uploadFolder]: folder where the uploaded file will be stored
 *        [readedBytes]: so far uploaded bytes
 *        [session_id]: actual upload session id
 * returns [fileObject]: from dropbox
 */
let multiRequestUploadFinish = (fileName, filePath, token, uploadFolder, readedBytes, session_id) => {

    const pathUrl = "/2/files/upload_session/finish";

    // HTTP-Header
    var headerOptions = JSON.stringify({
        "cursor": {
            "session_id": session_id,
            "offset": readedBytes
        },
        "commit": {
            "path": uploadFolder + "/" + fileName,
            "mode": "add",
            "autorename": true,
            "mute": true
        }
    });

    // An object of options to indicate where to post to
    var post_options_start = {
        host: this.contentUrl,
        path: pathUrl,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': headerOptions
        }
    };


    return new Promise((resolve, reject) => {
        // Set up the request
        let req = https.request(post_options_start, (res) => {

            var data = "";
            res.on('data', (chunk) => {
                // Add the data chunks
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode == 200)
                    resolve(JSON.parse(data));
                else reject(JSON.parse(data));
            });

        });

        req.on('error', (e) => {
            reject(e);
        });

        // Buffers the actual chunk of the file
        let buffer = new Buffer(CHUNK_SIZE);

        fs.open(filePath, 'r', function(err, fd) {
            if (err) throw err;

            function readNextChunk() {
                fs.read(fd, buffer, 0, CHUNK_SIZE, readedBytes, function(err, bytesRead) {
                    if (err) throw err;

                    if (bytesRead === 0) {
                        // done reading
                        console.log("Uploaded last 150MB");
                        req.end();

                        fs.close(fd, function(err) {
                            if (err) throw err;
                        });
                        return;
                    }

                    var data;
                    if (bytesRead < CHUNK_SIZE) {
                        // slice buffer if there is less data to upload then chunk size
                        data = buffer.slice(0, bytesRead);
                    } else {
                        // upload the whole buffer
                        data = buffer;
                    }

                    req.write(data, () => {
                        // Uplode more...
                        readNextChunk();
                    });


                });
            }
            // Start upload...
            readNextChunk();
        });
    });
}
