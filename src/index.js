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

// initialize express.js
var app = express();

// Set up a logger
app.use(morgan("combined"));

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// static files delivery
app.use("/build", express.static(__dirname + "/frontend/build/"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/frontend/index.html");
})

// restFULL api
const apiEnabled = config.get('http.api.enabled') || true;
const apiBaseUrl = config.get('http.api.baseUrl') || '/api/v1';


/**
 * Configuration of dropbox
 */

var sync = Promise.resolve();

import dropbox from "./setup/dropboxoauth";
sync = dropbox.initDropbox();

// End dropbox configuration

sync.then(() => {

	/**
	 * Configuration of the mail server
	 */

	var mailin = require('mailin');

	mailin.start({
		port: 1337,
		disableWebhook: true,
		requireAuthentication: false
	});
	/* Event emitted when a connection with the Mailin smtp server is initiated. */
	mailin.on('startMessage', function(connection) {
		/* connection = {
		    from: 'sender@somedomain.com',
		    to: 'someaddress@yourdomain.com',
		    id: 't84h5ugf',
		    authentication: { username: null, authenticated: false, status: 'NORMAL' }
		  }
		}; */
		console.log(connection);
	});

	/* Event emitted after a message was received and parsed. */
	mailin.on('message', function(connection, data, content) {
		console.log(data);
		mails.push(data);
		/* Do something useful with the parsed message here.
		 * Use parsed message `data` directly or use raw message `content`. */
	});

	mailin.on('error', function(error) {
		console.error(error);
	})

	// End of mail server configuration


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
			// Handle routes which don't exist
			app.use((req, res, next) => {
				res.status(404).send("Nothing found.")
			});

			// Catch errors
			app.use((err, req, res, next) => {
				console.error(err);
				res.status(500).send("Something went wrong");
			});
			return app.listen(3001);
			core.registerInformationTriggers();
		})
		.then(function() {
			console.log('Server is listening at port 3001.');
		})
		.catch(function(err) {
			console.log("Something went wrong, could not start the server:");
			console.log(err);
			process.exit(1);
		});

});