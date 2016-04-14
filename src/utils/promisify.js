/**
 * A utility to transform the "legacy style callbacks"
 * used by mongodb into slightly more handy promises.
 *
 * Usage:
 *	var promise = promisify();
 * 	legacyFunction(promise.callback);
 *
 *  promise.then(...)
 *	       .catch(...);
 */
var promisify = function(){
	var accept = null;
	var reject = null;

	var promise = new Promise(function(callAccept, callReject){
		accept = callAccept;
		reject = callReject;
	});

	promise.callback = function(err, result){
		if (err == null) {
			accept(result);
		} else {
			reject(err);
		}
	};

	return promise;

};

module.exports = promisify;
