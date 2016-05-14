/**
 * @author: Tobias Dorra
 */

function oneAsync(datum, promiseGenerator, previousResults) {
    let [previousSuccess, previousFail] = previousResults;

    return new Promise((resolve, reject) => {
        promiseGenerator(datum)
            .then(result => {
                previousSuccess.push(result);
                resolve([previousSuccess, previousFail]);
            })
            .catch(error => {
                previousFail.push(error);
                resolve([previousSuccess, previousFail]);
            });
    });
}

function forEachAsync(data, promiseGenerator) {
    let sync = Promise.resolve([
        [],
        []
    ]);
    for (let datum of data) {
        sync = sync.then(previousResults => {
            return oneAsync(datum, promiseGenerator, previousResults);
        });
    }
    return sync;
}

function forEachAsyncPooled(data, poolSize, promiseGenerator) {
    let workers = [];
    let done = 0;
    let poolWorker = function(previousResults) {
        if (data.length == done) {
            return Promise.resolve(previousResults);
        } else {
            let datum = data[done];
            done = done + 1;
            return oneAsync(datum, promiseGenerator, previousResults)
                .then(result => {
                    return poolWorker(result);
                });
        }
    };
    for (let i = 0; i < poolSize; ++i) {
        workers.push(poolWorker([
            [],
            []
        ]));
    }
    let results = Promise.all(workers).then(resultsArray => {
        return resultsArray.reduce(
            (a, b) => [a[0].concat(b[0]), a[1].concat(b[1])]
        ,[[],[]]);
    });
    return results;
}

module.exports.forEachAsync = forEachAsync;
module.exports.forEachAsyncPooled = forEachAsyncPooled;