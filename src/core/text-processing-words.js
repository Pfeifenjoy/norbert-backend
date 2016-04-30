/**
 * Compares two strings a and b. 
 *
 * Returns:
 *      -1 : iff a < b
 *       1 : iff b < a
 *       0 : iff a = b
 */
function strComp(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

/**
 * Makes sure that all words (strings) in the given array are in the database.
 * And returns the corresponding objects.
 */
function getWords(words) {

    // get the words from the db
    let wordsFromDb = this.db.collection('words')
        .find({'word': {'$in': words}})
        .toArray();

    // calc the words that where not found in the db
    let newWords = wordsFromDb.then(data => {
        words.sort(strComp);
        data.sort((a, b) => strComp(a.word, b.word));
        let newWords = [];
        let posW = 0; // position in the words array
        let posD = 0; // position in the data array
        for (posW = 0; posW < words.length; ++posW)
        {
            if (data[posD] && data[posD].word == words[posW]) {
                posD = posD + 1;
            } else {
                newWords.push(words[posW]);
            }
        }
        return newWords;
    });

    // build the db objects to insert.
    let wordCount = this.db.collection('words').count();
    let newObjects = Promise.all([newWords, wordCount]).then(arg => {
        let [words, wordCount] = arg;
        let create = words.map((w, i) => {
            return {
                '_id': (wordCount + i), 
                'word': w, 
                'documents': 0
            };
        });
        return create;
    });

    // do the actual insert
    let objectsInDb = newObjects.then(create => {
        if (create.length > 0) {
            return this.db.collection('words').insert(create);
        } else {
            return 'nothing to do';
        }
    });

    // return all objects when the insertation is done.
    return Promise.all([objectsInDb, newObjects, wordsFromDb])
        .then(arg => arg[2].concat(arg[1]));
}

/**
 * Creates a statistic of how often each word in words was used.
 */
function createWordHistogram(words) {
    let hist = {};
    for (let word of words) {
        if (hist[word] === undefined) {
            hist[word] = 0;
        }
        hist[word]++;
    }
    return hist;
}

/**
 * Adds a document to the word index. (allWords: array of strings)
 */
function addDocument(docId, allWords) {
    let hist = createWordHistogram(allWords);
    let words = Object.keys(hist);

    // make sure all words are in the database
    let wordObjects = getWords.bind(this)(words);

    // increase the document counter for every word in this document
    let wordIds = wordObjects.then(objs => objs.map(obj => obj._id));
    let docCounterIncremented = wordIds.then(ids => {
        return this.db.collection('words')
            .update(
                    {'_id': {'$in': ids}}, 
                    {'$inc': {'documents': 1}},
                    {'multi': true}
                    );
    });

    // create word counters for this document 
    let counters = wordObjects.then(objs => objs.map(obj => {
        return {
            'document': docId, 
            'word': obj._id, 
            'count': hist[obj.word]
        };
    }));
    let countersInserted = counters.then(documents => {
        if (documents.length > 0) {
            return this.db.collection('words_in_documents').insert(documents);
        } else {
            return 'nothing to do';
        }
    });

    // finished when all db queries are finished 
    return Promise.all([docCounterIncremented, countersInserted]);
}

/**
 * Removes a document from the word index.
 */
function removeDocument(docId) {

    // get the words of this document
    let wordCounters = this.db.collection('words_in_documents').find({'document': docId, 'count': {'$gt': 0}}).toArray();
    let wordIds = wordCounters.then(objs => objs.map(obj => obj.word));

    // decrement the document counter for every word 
    let documentCountersDecremented = wordIds.then(words => {
        return this.db.collection('words').update(
                {'_id': {'$in': words}},
                {'$inc': {'documents': -1}},
                {'multi': true}
                );
    });

    // remove the word counters 
    let wordCountersRemoved = wordCounters.then(() => {
         return this.db.collection('words_in_documents').remove({'document': docId});
    });

    // finished when all db queries are finished 
    return Promise.all([documentCountersDecremented, wordCountersRemoved]);
}

/**
 * Updates a document in the word index. (words: array of strings)
 */
function updateDocument(docId, words) {
    return Promise.resolve()
        .then(() => {
            return this.wordIndex_removeDocument(docId);
        }).then(() => {
            return this.wordIndex_addDocument(docId, words);
        });
}

/**
 * Returns an 
 */
function getDocuments(wordIds) {
    return this.db.collection('words_in_documents').find({'word': {'$in': wordIds}}).toArray();
}

module.exports.wordIndex_getWords = getWords;
module.exports.wordIndex_addDocument = addDocument;
module.exports.wordIndex_removeDocument = removeDocument;
module.exports.wordIndex_getDocuments = getDocuments;

