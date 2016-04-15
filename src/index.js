var express = require('express');
var routes = require('./restfull-api/routes.js');
import users from "./restful-api/users";
import morgan from "morgan";
import bodyParser from "body-parser";
import compression from "compression";
import db from "./core/database";
import core from "./core/core";

// initialize express.js
var app = express();

//Set up a logger
app.use(morgan("combined"));

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//routes
app.use('/api/v1', routes);
app.use("/api/v1", users);

//Handle routes which don't exist
app.use((req, res, next) => {
    res.status(404).send("Nothing found.")
});

//Catch errors
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Something went wrong");
});


// Establish database connection
db()
	.then(function(db){

        core.db = db;
        core.start();
        app.db = db;
		// start server
		app.listen(8080, function(){
			console.log('Server is listening at port 8080.');
		});	

	})
	.catch(function(err){

		console.log("Something went wrong, could not start the server:");
		console.log(err);

	});
