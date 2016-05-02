/**
 * @author Tobias Dorra
 *
 * This startup file runs the processes that
 * take some time: Fetching of Information from
 * the different data sources, text processing, ...
 */

import core from './core/core';

core.createCore()
	.then(function (core){
		console.log("Importing Information");
		core.importInformation()
			.then(function(){
				console.log("Imported  Information");
                console.log("Updating word index");
                return core.process();
            }).then(function(){
                console.log("Updated word index");
                console.log("Estimating recommendations.");
                return core.gmm();
            })
            .then(() => {
                console.log("Starting uploading files.");
                return core.uploadFiles();
            })
            .then(() => {
                console.log("Finished uploading files.");
                console.log("Finalizing.");
                return core.resetDirty();
            })
            .then(() => {
                console.log("Done.");
				process.exit(0);
            })
            .catch(function(err){
				console.log("Fail.");
				console.log(err);
                console.log(err.stack);
				process.exit(1);
			});
	})
	.catch(function (err){
		console.log("Something went wrong, could not run any batch jobs.");
		console.log(err);
		process.exit(1);
	});

