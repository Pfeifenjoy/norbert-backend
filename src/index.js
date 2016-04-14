var express = require('express');
var database = require('./core/database.js');
var routes = require('./restfull-api/routes.js');

// initialize express.js
var app = express();
app.use('/api/v1', routes);

// Establish database connection
database.connect()
	.then(function(){

		// start server
		app.listen(8080, function(){
			console.log('Server is listening at port 8080.');
		});	

	})
	.catch(function(err){

		console.log("Something went wrong, could not start the server:");
		console.log(err);

	});
