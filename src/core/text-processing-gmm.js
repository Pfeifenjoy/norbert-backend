var fs = require('fs');
import {exec} from 'child_process';
import config from '../utils/configuration';
import {ObjectID} from 'mongodb';

function gmm() {

    let rownums = {};
    let matrix = [];

    let rowOf = function(obj, i) {
        let str = JSON.stringify(obj.document.id);
        if (rownums[str] === undefined) {
            rownums[str] = matrix.length;
            matrix.push(Array.apply(null, Array(i)).map(x=>0));
        }
        return rownums[str];
    }

    let wordCount = this.db.collection('words').count();

    let word_doc = this.db.collection('words_in_documents').find({'document.type':'entries'}).toArray();

    let gmmDone = Promise.all([word_doc, wordCount]).then(data => {
        let [word_doc, wordCount] = data;
        for (let obj of word_doc) {
            let row = rowOf(obj, wordCount);
            let column = obj.word;
            if (obj.tfidf){
                matrix[row][column] = obj.tfidf;    
            } 
        }
        if (matrix.length < 10) return null;
        fs.writeFileSync('./files/tmp/gmm-in.json', JSON.stringify(matrix));
        
        let python_exe = config.get('commands.python3');
		var python_script = './src/core/text-processing-gmm.py';
        return new Promise((resolve, reject) => {
            exec([python_exe, python_script].join(' '),(error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                let result = JSON.parse(stdout);
                console.log(result[0]);
                resolve(result);
            });
        });
        
    });

    let allEntries = this.db.collection('entries').find({}).toArray();

    let userPrefs = {};
    let userCounts = {};

    let asdf = Promise.all([allEntries, gmmDone]).then(data => {
        let [entries, clusters] = data;

        if (entries === null) return;
        
        for (let entry of entries){
            let id = JSON.stringify(entry._id);
            let row = rownums[id];
            let user = entry.owned_by;
            if (row) {
                if (userCounts[user] == undefined) {
                    userCounts[user] = 1;
                    userPrefs[user] = clusters[row];
                } else {
                    ++userCounts[user];
                    userPrefs[user] = userPrefs[user].map((val, ind) => val + clusters[row][ind]);
                }
            }
        }

        for (let key of Object.keys(userPrefs)) {
            userPrefs[key] = userPrefs[key].map(val => val / userCounts[key]);
        }

        let queries = [];

        for (let entry of entries) {
            let id = JSON.stringify(entry._id);
            let row = rownums[id];
            let user = JSON.stringify(entry.owned_by);
            if (row) {
                for (let key of Object.keys(userPrefs)) {
                    let curr_user = key;
                    let curr_userpref = userPrefs[key];
                    let curr_entry = clusters[row];
                    let likelihood = curr_userpref.map((val, ind) => val * curr_entry[ind]).reduce((a,b)=>a+b,0);
                    let query = {'where':{'_id': ObjectID(entry._id)}, 'update': {'$set':{}}};
                    query.update['$set']['likelihood.' + curr_user] = likelihood;
                    queries.push(query);
                }
            }
        }

        let sync = Promise.resolve();
        for (let q of queries) {
            sync = sync.then(() => {
                return this.db.collection('entries').update(q.where, q.update);
            });
        }
        console.log(queries);
        return sync;
    });

    return asdf;

    
    
}

module.exports.gmm = gmm;
