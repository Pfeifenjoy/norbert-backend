/**
 * @author: Tobias Dorra
 */

import {fork} from 'child_process';
import config from '../utils/configuration'

/**
 * Executes the actual batch object and returns
 * a promise.
 */
var run = function(){
	// create promise manually - promises are not supported by fork by default. 
	return new Promise(function(resolve, reject){

		// suppress execution of the process if disabled
		var enabled = config.get("taskScheduler.enabled");
		if (enabled === false) {
			console.log("Suppressed execution of the batch process, because it was disabled in the settings file at 'taskScheduler.enabled'.");
			reject("disabled");
			return;
		}

		// some logginig
		console.log("Starting batch process...");

		// execute the batch process as a sub process.
		var script = __dirname + '/../batch.js';
		var proc = fork(script, [], {
			"silent": true
		});

		// forward output
		proc.stdout.on('data', (data) => {
            var output = data
                .toString()
                .trimRight()
                .split('\n')
                .map(line => '> ' + line)
                .join('\n');
			console.log(output);
		});

		proc.stderr.on('data', (data) => {
			process.stdout.write("err> " + data);
		});

		// wait for proc to finish
		proc.on('close', (code) => {
			// log
			console.log("Batch process finished with exit code " + code + ".");

			// resolve or reject the promise based on the error code.
			if (code == null) {
				resolve();
			} else {
				reject(code);
			}
		});
	});
};

/**
 * trigger:
 * Controlls the execution of the batch process,
 * so that it cannot lead to multiple parallel instances.
 */
 // status variables
var running = false;
var runAgain = false;
var trigger = function(){
	if (running) {
		runAgain = true;
	} else {
		var afterRun = function(){
			running = false;
			if (runAgain) {
				runAgain = false;
				trigger();
			}
		};
		running = true;
		run()
			.then(afterRun)
			.catch(afterRun);
	}
};

/**
 * Starts to trigger the batch process every <taskScheduler.interval> milliseconds.
 */
var start = function(){
	// schedule the first run
	trigger();
	
	// schedule to run every x milliseconds
	var delay = config.get("taskScheduler.interval") || 600000;
	setInterval(trigger, delay);
};

module.exports.start = start;
module.exports.trigger = trigger;
