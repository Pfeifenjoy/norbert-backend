/**
 * @author Arwed Mett, Tobias Dorra
 *
 * This startup file runs the HTTP subsystem of 
 * Norbert. It is responsible for the delivery
 * of the frontend and provides the RESTful api.
 * It also starts the scheduler to run the 
 * "batch"-script from time to time.
 */
import express from 'express';
import routes from "./restful-api/routes";
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
app.use(bodyParser.urlencoded({extended: true}));

// static files delivery
// TODO

// restFULL api
var apiEnabled = config.get('http.api.enabled');
var apiBaseUrl = config.get('http.api.baseUrl') || '/api/v1';
if (apiEnabled) {
	app.use(apiBaseUrl, routes);
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

// Start the task scheduler
scheduler.start();

// Initialize the core
core.createCore()
	.then(function(core){
		// Start the server
		app.core = core;
		return app.listen(8080);
	})
	.then(function(){
		console.log('Server is listening at port 8080.');
	})
	.catch(function (err){
		console.log("Something went wrong, could not start the server:");
		console.log(err);
		process.exit(1);
	});
