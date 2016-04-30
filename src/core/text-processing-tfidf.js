
function updateTfIdf(words_str, nr_documents) {
    // see: https://de.wikipedia.org/wiki/Tf-idf-Ma%C3%9F

    let words = this.wordIndex_getWords(words_str);
    let wordIds = words.then(words => words.map(w => w._id));
    let documents = wordIds.then(ids => this.wordIndex_getDocuments(ids));

    return Promise.all([words, documents]).then(attr => {
        let [words, docs] = attr;
        words.sort((a, b) => a._id - b._id);
        docs.sort((a, b) => a.word - b.word);
        let promises = [];
        let wordPos = 0;
        let docPos  = 0;
        for (docPos = 0; docPos < docs.length; ++docPos) {
            while (docs[docPos].word != words[wordPos]._id) ++wordPos;
            let doc  = docs[docPos];
            let word = words[wordPos];
            let tf = doc.normalizedCnt;
            let idf = Math.log(nr_documents / word.documents);
            let tfidf = tf * idf;
            let update = this.db.collection('words_in_documents').update({'_id': doc._id}, {'$set': {'tfidf': tfidf}});
            promises.push(update);
        }

        return Promise.all(promises);
    });
}

module.exports.updateTfIdf = updateTfIdf;
