/**
 * @author Tobias Dorra
 */
import { loadComponent } from './component';
import { states } from './file';
import { ObjectId } from "mongodb";

function uploadFiles() {
    let query = {'dirty': true};
    let informationCursor = this.db.collection('information').find(query);
    let entryCursor = this.db.collection('entries').find(query);

    let informationUpload = uploadCursorDocuments.bind({
        collection: this.db.collection("informations")
    }, informationCursor);

    let entryUpload = uploadCursorDocuments.bind({
        collection: this.db.collection("entries")
    }, entryCursor)

    let finish = ()=>{return Promise.resolve();}; 

    return Promise.resolve()
        .then(informationUpload)
        .then(entryUpload)
        .then(finish, finish);
}

function uploadCursorDocuments(cursor) {
    return new Promise((resolve, reject) => {
        let uploads = [];
        let allDocuments = [];
        cursor.each((err, doc) => {
            if(err) console.error(err);
            else if(!doc) {
                return Promise.all(uploads)
                .then(() => {
                    allDocuments.forEach(doc => {
                        let _id = ObjectId(doc._id);
                        delete doc._id;
                        this.collection.update(
                            { _id },
                            doc);
                    });
                })
                .then(resolve)
                .catch(reject);
            }
            else {
                let { components } = doc;
                allDocuments.push(doc);
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
