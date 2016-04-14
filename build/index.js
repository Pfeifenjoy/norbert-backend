(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['express', './restfull-api/routes.js'], factory);
	} else if (typeof exports !== "undefined") {
		factory(require('express'), require('./restfull-api/routes.js'));
	} else {
		var mod = {
			exports: {}
		};
		factory(global.express, global.routes);
		global.index = mod.exports;
	}
})(this, function (express, routes) {
	'use strict';

	var app = express();
	app.use('/api/v1', routes);
	app.listen(8080, function () {
		console.log('Server is listening at port 8080.');
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1VBQXNCLFdBQ0Q7O2tCQURDLG9CQUNEOzs7Ozs7OzttQkFEakIsU0FDQTs7O0FBRUosS0FBSSxNQUFNLFNBQU47QUFDSixLQUFJLEdBQUosQ0FBUSxTQUFSLEVBQW1CLE1BQW5CO0FBQ0EsS0FBSSxNQUFKLENBQVcsSUFBWCxFQUFpQixZQUFVO0FBQzFCLFVBQVEsR0FBUixDQUFZLG1DQUFaLEVBRDBCO0VBQVYsQ0FBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbnZhciByb3V0ZXMgPSByZXF1aXJlKCcuL3Jlc3RmdWxsLWFwaS9yb3V0ZXMuanMnKTtcblxudmFyIGFwcCA9IGV4cHJlc3MoKTtcbmFwcC51c2UoJy9hcGkvdjEnLCByb3V0ZXMpO1xuYXBwLmxpc3Rlbig4MDgwLCBmdW5jdGlvbigpe1xuXHRjb25zb2xlLmxvZygnU2VydmVyIGlzIGxpc3RlbmluZyBhdCBwb3J0IDgwODAuJyk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
