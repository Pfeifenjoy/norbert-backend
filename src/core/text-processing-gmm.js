var fs = require('fs');
import {exec} from 'child_process';
import config from '../utils/configuration';
import {ObjectID} from 'mongodb';
import {forEachAsync} from './../utils/foreach-async';

const tmpMatrixFileName = './files/tmp/gmm-in.json';
const pythonScript = './src/core/text-processing-gmm.py';
const pythonExe = config.get('commands.python3');

class ContiguousIndex {
    constructor(values) {
        let valueToIndex = {};
        let nrValues = 0;
        let domain = [];

        for (let value of values) {
            let key = JSON.stringify(value);
            if (valueToIndex[key] === undefined) {
                valueToIndex[key] = nrValues;
                nrValues = nrValues + 1;
                domain.push(value);
            }
        }

        this.nrValues = nrValues;
        this.valueToIndex = valueToIndex;
        this.domain = domain;
    }

    indexOf(value) {
         let str = JSON.stringify(value);
         return this.valueToIndex[str];
    }
}

function gmm(dataset, idColumn, featureColumn, valueColumn){
    
    // 1) Create the input matrix for the GMM 

    let ids = dataset.map(obj => obj[idColumn]);
    let idToIndex = new ContiguousIndex(ids);

    let features = dataset.map(obj => obj[featureColumn]);
    let featureToIndex = new ContiguousIndex(features);

    let nrRows = idToIndex.nrValues;
    let nrCols = featureToIndex.nrValues;
    
    // init the matrix with zeroes
    let matrix = [];
    for (let row = 0; row < nrRows; ++row) {
        let matrixRow = [];
        for (let col = 0; col < nrCols; ++col) {
            matrixRow.push(0);
        }
        matrix.push(matrixRow);
    }

    // Insert the data 
    for (let datum of dataset) {
        let row = idToIndex.indexOf(datum[idColumn]);
        let col = featureToIndex.indexOf(datum[featureColumn]);
        let value = datum[valueColumn] || 0;
        matrix[row][col] = value;
    }

    // 2) Write the matrix to a file and call Scikit-Learn to do its work
    fs.writeFileSync(tmpMatrixFileName, JSON.stringify(matrix));

    let clusteringDone = new Promise((resolve, reject) => {
        exec([pythonExe, pythonScript].join(' '),(error, stdout, stderr) => {
            if (error) {
                console.log('Error while executing: ', pythonExe, pythonScript);
                console.log('Return code: ', error.code);
                console.log('Stderr: ', stderr);
                return reject(error);
            }
            let result = JSON.parse(stdout);
            resolve(result);
        });
    });

    // 3) Convert the resulting matrix back to 'readable' objects
    let result = clusteringDone.then(matrix => {
        let result = [];
        for (let id of idToIndex.domain) {
            let row = idToIndex.indexOf(id);
            let resultObject = {};
            resultObject[idColumn] = id;
            resultObject.clusters = matrix[row];
            result.push(resultObject);
        }
        return result;
    });

    return result;
}

function calculateRecommendations() {

    // 1) Get the data
    let wordsInDocuments = this.db.collection('words_in_documents')
        .find({'document.type':'entries'})
        .toArray();

    // 2) Cluster the data 
    let clusters = wordsInDocuments.then(data => {
        return gmm(data, 'document', 'word', 'tfidf');
    });

    // 3) Calculate for each user the interest for every cluster
    
    // create a map from entries to users 
    let entries = this.getEntriesOrderedByUser();
    let entriesToUsers = entries.then(entries => {
        let result = {};
        for (let entry of entries) {
            result[entry.id] = entry.owned_by;
        }
        return result;
    });

    // do the actual calculations
    let userInterests = Promise.all([clusters, entriesToUsers])
        .then(args => {
            let [clusters, entriesToUsers] = args; 
            let result = {};
            let documentCounts = {};

            // sum up the cluster-values for the entries of each user.
            // and count the number of entriesfor each user.
            for (let document of clusters) {
                let entryid = document.document.id;
                let userid = entriesToUsers[entryid];
                if (result[userid] === undefined) {
                    result[userid] = document.clusters; 
                    documentCounts[userid] = 1;
                } else {
                    documentCounts[userid] = documentCounts[userid] + 1;
                    result[userid] = result[userid].map(
                        (val, ind) => val + document.clusters[ind]
                    );
                }
            }

            // normalize the interest values using the number of entries.
            for (let userid of Object.keys(result)) {
                result[userid] = result[userid].map(
                    val => val / documentCounts[userid]
                ); 
            }

            return result;
        });

    // 4 ) For each document, calculate how interested the user might be in this document based on 
    //       - the interest of the user in the individual clusters 
    //       - the cluster values of each entry

    let likelihoods = Promise.all([clusters, userInterests])
        .then(arg => {
            let [clusters, interests] = arg;
            let result = [];
            for (let entry of clusters) {
                for (let userid of Object.keys(interests)) {
                    let entryClusterValues = entry.clusters;
                    let userClusterInterests = interests[userid];

                    // this basically calculates the dot product... just to give the beast a name...
                    let likelihood = entryClusterValues.map(
                        (val, ind) => val * userClusterInterests[ind]
                    ).reduce(
                        (a, b) => a + b
                    , 0);

                    result.push({
                        'entry': entry.document.id,
                        'user': userid,
                        'likelihood': likelihood
                    });
                }
            }
            return result;
        });

    // 5 ) Write the result to the database.

    let done = likelihoods.then(likelihoods => {
        return forEachAsync(likelihoods, obj => {
            let set = {};
            set['likelihood.' + obj.user] = obj.likelihood;
            return this.db.collection('entries').update({'_id': ObjectID(obj.entry)}, {'$set': set});
        });

    });

    return done;
}

module.exports.gmm = gmm;
module.exports.calculateRecommendations = calculateRecommendations;

