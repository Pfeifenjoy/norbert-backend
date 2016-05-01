/**
 * @author Tobias Dorra
 */
import { loadComponent } from './component';
import { states } from './file';

function uploadFiles() {
    let query = {'dirty': true};
    let informationCursor = this.db.collection('information').find(query);
    let entryCursor = this.db.collection('entries').find(query);

    let finish = ()=>{return Promise.resolve();}; 

    return Promise.resolve()
        .then(uploadCursorDocuments.bind(this, entryCursor))
        .then(uploadCursorDocuments.bind(this, informationCursor))
        .then(finish, finish);
}

function uploadCursorDocuments(cursor) {
    return new Promise((resolve, reject) => {
        let uploads = [];
        let components = null;
        cursor.each((err, doc) => {
            if(err) console.error(err);
            else if(!doc) {
                return Promise.all(uploads)
                .then(() => {
                    console.log(components);
                })
                .then(resolve)
                .catch(reject);
            }
            else {
                components = doc.components;
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



module.exports.uploadFiles = uploadFiles;
