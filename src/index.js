/**
 * @author Arwed Mett, Tobias Dorra, Philipp Pütz
 *
 * This startup file runs the HTTP subsystem of 
 * Norbert. It is responsible for the delivery
 * of the frontend and provides the RESTful api.
 * It also starts the scheduler to run the 
 * "batch"-script from time to time.
 */
import express from 'express';
import {initialRoutes} from "./restful-api/routes";
import core from './core/core';
import config from "./utils/configuration";
import scheduler from "./task-scheduler/scheduler"
import morgan from "morgan";
import bodyParser from "body-parser";
import compression from "compression";
import path from "path";

// initialize express.js
var app = express();

// Set up a logger
app.use(morgan("combined"));

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


// RESTful api
const apiEnabled = config.get('http.api.enabled') || true;
const apiBaseUrl = config.get('http.api.baseUrl') || '/api/v1';
const port = config.get("port") || 3001;


/**
 * Configuration of dropbox
 */

var sync = Promise.resolve();

import dropbox from "./setup/dropboxoauth";
sync = dropbox.initDropbox();

// End dropbox configuration

sync.then(() => {

	// Start the task scheduler
	scheduler.start();

	// Initialize the core
	core.createCore()
		.then(function(core) {
			// Start the server
			app.core = core;
			if (apiEnabled) {
				app.use(apiBaseUrl, initialRoutes(core));
			}
            // static files delivery
            app.use("/build", express.static(path.resolve(__dirname + "/../files/frontend/build/")));

            app.get("*", (req, res) => {
                res.sendFile(path.resolve(__dirname + "/../files/frontend/index.html"));
            })
			// Handle routes which don't exist
			app.use((req, res, next) => {
				res.status(404).send("Nothing found.")
			});

			// Catch errors
			app.use((err, req, res, next) => {
				console.error(err);
				res.status(500).send("Something went wrong");
			});
			core.registerInformationTriggers();
			return app.listen(port);
		})
		.then(function() {
			console.log(`Server is listening at port ${port}.`);
		})
		.catch(function(err) {
			console.error("Something went wrong, could not start the server:");
			console.error(err);
			process.exit(1);
		});

});
