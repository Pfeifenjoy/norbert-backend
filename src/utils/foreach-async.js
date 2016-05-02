
function oneAsync(datum, promiseGenerator, previousResults) {
    let [previousSuccess, previousFail] = previousResults;

    return new Promise((resolve, reject) => {
        promiseGenerator(datum)
            .then(result => {
                previousSuccess.push(result);
                resolve([previousSuccess, previousFail]);
            })
            .catch(error => {
                previousSuccess.push(error);
                resolve([previousSuccess, previousFail]);
            });
    });
}

function forEachAsync(data, promiseGenerator) {
    let sync = Promise.resolve([[],[]]);
    for (let datum of data){
        sync = sync.then(previousResults => {
            return oneAsync(datum, promiseGenerator, previousResults);
        });
    }
    return sync;
}

module.exports.forEachAsync =forEachAsync;
