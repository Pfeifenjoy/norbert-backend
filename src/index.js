var express = require('express');
var routes = require('./restfull-api/routes.js');

var app = express();
app.use('/api/v1', routes);
app.listen(8080, function(){
	console.log('Server is listening at port 8080.');
});
