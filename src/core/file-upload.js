/**
 * @author Tobias Dorra
 */
import { loadComponent } from './component';
import { states } from './file';

function uploadFiles() {
    let query = {'dirty': true};
    let informationCursor = this.db.collection('information').find(query);
    let entryCursor = this.db.collection('entries').find(query);

    let uploadInfo  = uploadCursorDocuments.bind(null, informationCursor);
    let uploadEntry = uploadCursorDocuments.bind(null, entryCursor);
    let finish = ()=>{return Promise.resolve();}; 

    return Promise.resolve()
        .then(uploadEntry)
        .then(uploadInfo, uploadInfo)
        .then(finish, finish);
}

function uploadCursorDocuments(cursor) {
    let upload = obj => {

        // get the files
        let files = obj.components.map(c => {
            let component = loadComponent(c);
            return component.getFiles();
        }).reduce((a, b) => {
            return a.concat(b);
        });

        // upload: use a promise for syncing
        let sync = Promise.resolve();
        for (let file of files) {
            let doUpload = uploadNewsfeedObjectDocs.bind(null, file);
            sync = sync.then(doUpload, doUpload); 
        }

        return sync;

    };

    let uploadNext = () => {
        return cursor.next()
            .then((obj) => {
                if (obj) {
                    return upload(obj)
                        .then(uploadNext);
                }
            });
    };

    return cursor.next()
        .then(uploadNext);
}

function uploadNewsfeedObjectDocs(file) {
    if (file.status == states.local_file) {
         return file.upload();
    } else {
         return Promise.resolve();
    }
}

module.exports.uploadFiles = uploadFiles;
