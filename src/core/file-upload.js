/**
 * @author Tobias Dorra, Arwed Mett
 */

import { forEachAsync } from '../utils/foreach-async.js';

/**
 * Uploads all new files to the storage provider.
 */
function uploadFiles() {

    // get the dirty entries
    let entries = this.findDirtyEntries();

    // upload the dirty entries
    let uploadEntriesComplete = entries.then(entries => {
        return uploadNewsfeedObjectsFiles(entries);
    });

    // save the entries
    let entriesDone = uploadEntriesComplete.then(entries => {
        return forEachAsync(entries, entry => {
            return this.updateEntry(entry);
        });
    });

    // get the dirty information
    let information = entriesDone.then(() => this.findDirtyInformation());

    // upload the dirty information
    let uploadInfoComplete = information.then(information => {
        return uploadNewsfeedObjectsFiles(information);
    });

    // save the information
    let done = uploadInfoComplete.then(information => {
        forEachAsync(information, info => {
            return this.updateInformation(info);
        });
    });
    
    return done;
}

/**
 * Uplads all local files of a newsfeed object to 
 * the storage provider (e.g. Dropbox)
 *
 * newsfeedObject: The newsFeedObject which files should be uploaded
 *
 * returns: A promise that will be resolved when the upload is done.
 *
 */
function uploadNewsfeedObjectFiles(newsfeedObject) {

    // get the files
    let files = newsfeedObject.components
        .map(component => component.getFiles())
        .reduce((a, b) => a.concat(b), []);

    // upload all files
    let result = forEachAsync(files, file => {
        return file.upload()
    });

    // return a promise.
    return result;
}

/**
 * Uplads all local files of multiple newsfeed objects to 
 * the storage provider (e.g. Dropbox). It basically works 
 * like uploadNewsfeedObjectFiles, but takes an array of 
 * newsfeed objects instead of a single one.
 *
 * newsfeedObjects: An Array of Newsfeed Objects whose files should be uploaded.
 *
 * returns: A promise that will be resolved when the upload is complete.
 *          The parameter given to it is the array of the (changed) newsfeed objects.
 */
function uploadNewsfeedObjectsFiles(newsfeedObjects) {

    //upload everything
    let uploadCompleted = forEachAsync(newsfeedObjects, newsfeedObject => {
        return uploadNewsfeedObjectFiles(newsfeedObject);
    });

    // return a promise with the changed entries
    return uploadCompleted.then(() => {
        return newsfeedObjects;
    });
}

module.exports.uploadFiles = uploadFiles;
