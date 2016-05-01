/**
 * @author: Tobias Dorra, Arwed Mett
 */
import config from './../utils/configuration';
import {loadPlugin} from './../utils/load-plugins';
import {after} from './../utils/after-promise';
import fs from 'fs';
import process from 'process';
import path from 'path';

const no_file = 'empty';
const local_file = 'local';
const remote_file = 'remote';

const origFileNameDefault = 'Norbert';

/**
 * A version of fs.unlink that uses Promises.
 */
function deleteFile(filename) {
    return new Promise((resolve, reject) => {
        fs.unlink(filename, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

let tmpFileCounter = 0;
function buildTempFileName(extension = 'tmp') {
    // build a unique identifier
    let prefix = 'norbert-dhbw';            // no collisions with other files not belonging to norbert (in case of /tmp as temp dir)
    let pid = process.pid;                  // no collisions with other processes from norbert running at the same time.
    let time = Date.now();                  // no collisions with other processes from norbert that ran previously and with the same pid and did not tidy up temp files
    tmpFileCounter = tmpFileCounter + 1;    // no collisions with other temporary files created by this process in the same milli second.
    let uid = prefix + '_'
        + pid.toString() + '_'
        + time.toString() + '_'
        + tmpFileCounter.toString();

    // build the actual path
    let filename = uid + '.' + extension;
    let folder = config.get('files.tmpFolder') || '/tmp';
    return path.join(folder, filename);
}

/**
 * load the Storage Service
 */
// "ss" = "Storage Service"
let ssObject = null;
let ssName = null;
function getStorageService() {
    if (ssName === null) {
        let ssPlugin = config.get('files.storageService');
        let {name, object} =  loadPlugin(ssPlugin);
        ssObject = object;
        ssName = name;
    }
    return [ssName, ssObject];
}


/**
 * Represents a file. (e.G. an Attachment to an Entry.)
 *
 * A file can have 3 states:
 *      'empty' : No actual file was specified.
 *                This should only be the case directly
 *                after the creation of the object.
 *      'local' : The file is temporarily stored locally on the server,
 *                will be uploaded to the Storage Service soon(ish).
 *      'remote': The file was uploaded to the storage provider.
 */
class File {

    constructor(dbObject = {}) {
        this._obj = dbObject;

        this._obj.state    = this._obj.state    || no_file;
        this._obj.location = this._obj.location || '';
        this._obj.originalFileName = this._obj.originalFileName || origFileNameDefault;
    }

    /**
     * Object that can be stored in the database.
     */
    get dbRepresentation(){
        return Object.assign({}, this._obj);
    }

    /**
     * Get the state. The three values
     * 'empty', 'local' and 'remote' are possible.
     */
    get state() {
        return this._obj.state;
    }

    set state(state) {
        this._obj.state = state;
    }

    /**
     * The file name of the file when it was on the user's local pc.
     */
    get originalFileName() {
        return this._obj.originalFileName;
    }

    set originalFileName(value) {
        this._obj.originalFileName = value;
    }

    /**
     * Set to a local file
     */
    setToLocalFile(filename) {
        this._obj.state = local_file;
        this._obj.location = filename;
        this._obj.originalFileName = path.basename(filename);
    }

    /**
     * Set to a file that was already uploaded to 
     * the current(!) Storage Service.
     */
    setToRemoteFile(file, originalFileName = origFileNameDefault) {
        let [ssName, storageService] = getStorageService();
        this._obj.state = remote_file;
        this._obj.location = file;
        this._obj.originalFileName = originalFileName;
        this._obj.ss = ssName;
    }

    /**
     * Upload the local file to the Storage Service.
     * This changes the state from 'local' to 
     * 'remote', if successfull. So, don't forget to persist 
     * this new state in the database!
     */
    upload() {
        let [ssName, storageService] = getStorageService();

        console.log(this.state == local_file ? "uploading" : "not uploadng");
        if (this.state == local_file) {
            let oldLocation = this._obj.location;
            return storageService.upload(oldLocation, this.originalFileName)
            .then(remoteFile => {
                this._obj.ss = ssName;
                this._obj.state = remote_file;
                this._obj.location = remoteFile;
                console.log("uploaded");

                //return deleteFile(oldLocation);
            })
            .catch(e => {
                console.error(e);
            });
        } else if(this.state == remote_file) {
            return Promise.resolve();
        } else {
            return Promise.reject('There is no file to upload.');
        }
    }

    /**
     * Downloads the file from the Storage Service to 
     * a temporary file.
     *
     * The result is an Object of the following structure:
     *      {
     *          "filename": the path to the downloaded file 
     *          "unlink": a function that must be called,
     *                  when the temporary file is not 
     *                  needed any more.
     *      }
     */
    getTemporary() {
        let [ssName, storageService] = getStorageService();

        if (this.state == local_file) {

            // local file: can be accessed directly, but do not delete! 
            return Promise.resolve({
                "filename": this._obj.location,
                "unlink": function(){}
            });

        } else if (this.state == remote_file && this._obj.ss == ssName) {

            // remote file: download and use the downloaded file. Delete it when not needed any more.
            let filename = buildTempFileName();
            return storageService.download(this._obj.location, filename)
                .then(() => {
                    return {
                        "filename": filename,
                        "unlink": deleteFile.bind(undefined, filename)
                    };
                });

        } else if (this.state == remote_file) {

            // remote file, but not created with the currently configured Storage Service.
            //          --> error. Shout at the user.
            return Promise.reject('The file was uploaded using a different storage provider. It looks like you did not properly migrate your files when switching out the Storage Service.');

        } else {

            // state "empty". No file present --> error
            return Promise.reject('There is no file.'); 

        }
    }

    /**
     * Returns a URL that can be used to link to this 
     * file at the content provider.
     */
    getUrl() {
        if (this.state != remote_file) {
             return undefined;
        }
        let [ssName, storageService] = getStorageService();
        return storageService.getUrl(this._obj.location);
    }

    get stream() {
        return fs.createWriteStream(this._obj.location);
    }

}

class UniqueFile extends File {
    constructor() {
        super({
            location: buildTempFileName()
        });
    }
}

module.exports = {
    File,
    UniqueFile,
    states: {
        no_file: no_file,
        local_file: local_file,
        remote_file: remote_file
    }
}

