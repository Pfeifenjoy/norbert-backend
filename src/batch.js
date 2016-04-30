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
			}).then(function(){
                console.log("Updating word index - Entries");
                // todo
                // - get updated entries
                // - extract text
                // - update word index
                // - update tfidf
                console.log("Updating word index - Information");
                // todo
            }).then(function(){
                console.log("Updated word index");
				process.exit(0);
            }).catch(function(err){
				console.log("Fail.");
				console.log(err);
				process.exit(1);
			});
	})
	.catch(function (err){
		console.log("Something went wrong, could not run any batch jobs.");
		console.log(err);
		process.exit(1);
	});

