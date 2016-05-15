/**
 * @author: Tobias Dorra
 */

import {forEachAsync} from '../utils/foreach-async';

function toIds(entries, type) {
    let documentIds = entries.map(e => {
        return {'type': type, 'id': e.id};
    });
    return documentIds;
}

function getCurrentWordIds(entries, type) {
    let docs = toIds(entries, type);
    return this.wordIndex_getWordIdsOfDocuments(docs);
}

function removeFromIndex(entries, type) {
    let oldWords = getCurrentWordIds.bind(this)(entries, type);

    console.log('Removing from word index: ');
    let ids = toIds(entries, type);
    let sync = oldWords;
    for (let id of ids) {
        sync = sync.then(() => console.log('  Document: ', id));
        sync = sync.then(() => this.wordIndex_removeDocument(id));
    }

    let result = Promise.all([sync, oldWords])
        .then(data => data[1]);

    return result;
}

function updateSingleDocumentInIndex(entry, type) {
    let text = this.extractText(entry);

    let wordsStr = text.then(result => {
        let text = result[0] + ' ' + result[0] + ' ' + result[0] + ' ' + result[0] + ' '
                 + result[1] + ' ' + result[1] + ' '
                 + result[2];
        console.log('     extracted text');
        let tokens = this.tokenize(text);        
        console.log('     tokenized. ', tokens.length, ' tokens.');
        let filtered = tokens.filter(t => !this.isStopWord(t));
        console.log('     eliminated stopwords. ', filtered.length, ' tokens left.');
        let stemms = filtered.map(word => this.stemm(word));
        console.log('     stemmed words. ');
        return stemms;
    });

    let [id] = toIds([entry], type);

    let updated = wordsStr.then(stemms => {
        console.log('     updating index. ');
        return this.wordIndex_updateDocument(id, stemms)
            .then(() => {
                console.log('  Document ok: ', id); 
            });
    });
       
    console.log('  Document: ', id);

    return updated;
}

function updateInIndex(entries, type) {
    console.log('Reinserting into word index: ');

    let oldWords = getCurrentWordIds.bind(this)(entries, type);

    let sync = forEachAsync(entries, entry => {
        return updateSingleDocumentInIndex.bind(this)(entry, type);
    });

    let newWords = sync.then(() => {
         return getCurrentWordIds.bind(this)(entries, type);
    });

    let result = Promise.all([oldWords, newWords])
        .then(data => {
            return data[0].concat(data[1]); 
        });

    return result;
}



function process() {

    let deletedEntries = this.findDeletedEntries();
    let updatedEntries = this.findDirtyEntries();
    let deletedInformation = this.findDeletedInformation();
    let updatedInformation = this.findDirtyInformation();

    let processedDeletedEntries = deletedEntries
        .then(entries => {
            return removeFromIndex.bind(this)(entries, 'entries');
        });

    let processedUpdatedEntries = Promise.all([updatedEntries, processedDeletedEntries])
        .then(data => {
             return updateInIndex.bind(this)(data[0], 'entries');
        });

    let processedDeletedInformation = Promise.all([deletedInformation, processedUpdatedEntries])
        .then(data => {
             return removeFromIndex.bind(this)(data[0], 'info');
        });

    let processedUpdatedInformation = Promise.all([updatedInformation, processedDeletedInformation])
        .then(data => {
             return updateInIndex.bind(this)(data[0], 'info');
        });

    let entryCount = this.getEntryCount();
    let infoCount = this.getInformationCount();
    let documentCount = Promise.all([entryCount, infoCount])
        .then(data => {
             return data[0] + data[1];
        });

    let allWords = Promise.all([processedDeletedEntries, processedDeletedInformation, processedUpdatedEntries, processedUpdatedInformation])
        .then(data => {
             return data[0].concat(data[1], data[2], data[3]);
        });

    let updatedTfIdf = Promise.all([allWords, documentCount])
        .then(data => {
            console.log('Updating Tf-Idf values.');
            let [words, docCount] = data;
            return this.updateTfIdf(words, docCount);
        });

    return updatedTfIdf;
}

function resetDirty(){
    console.log('pre-cleanup');
    let eDirt = this.db.collection('entries').updateMany({'dirty': true}, {'$set': {'dirty': false}});
    let iDirt = this.db.collection('information').updateMany({'dirty': true}, {'$set': {'dirty': false}});
    return Promise.all([eDirt, iDirt]).then(() => {
        console.log('mid-cleanup');
        let eDel = this.db.collection('entries').remove({'deleted': true});
        let iDel = this.db.collection('information').remove({'deleted': true});
        return Promise.all([eDel, iDel]);
    }).then(() => {
        console.log('post-cleanup');
    });
}

module.exports.process = process;
module.exports.resetDirty = resetDirty;
