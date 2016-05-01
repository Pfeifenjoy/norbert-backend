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
    //let uploadEntry = uploadCursorDocuments.bind(null, entryCursor);
    let finish = ()=>{return Promise.resolve();}; 

    return Promise.resolve()
        .then(uploadEntries.bind(this, entryCursor))
        //        .then(uploadInfo, uploadInfo)
        //        .then(finish, finish);
}

function uploadEntries(cursor) {
    return new Promise((resolve, reject) => {
        let uploads = [];
        cursor.each((err, doc) => {
            if(err) console.error(err);
            else if(!doc) {
                let sync = Promise.all(uploads)
                .then(() => {
                    console.log(files);
                });
                return resolve(sync);
            }
            else {
                let { components } = doc;
                let files = components
                .map(c => loadComponent(c).getFiles())
                .reduce((a, b) => a.concat(b), [])

                for(let file of files) {
                    uploads.push(file.upload())
                }


            }
        });
    });
}


function uploadCursorDocuments(cursor) {
    let upload = obj => {

        let { components } = obj;
        // get the files
        let files = components.map(c => {
            let component = loadComponent(c);
            return component.getFiles();
        }).reduce((a, b) => {
            return a.concat(b);
        }, []);

        // upload: use a promise for syncing
        let sync = Promise.resolve();
        for (let file of files) {
            let doUpload = uploadNewsfeedObjectDocs.bind(null, file);
            sync = sync.then(doUpload, doUpload)
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

module.exports.uploadFiles = uploadFiles;
