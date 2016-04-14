(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["module", 'express'], factory);
	} else if (typeof exports !== "undefined") {
		factory(module, require('express'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod, global.express);
		global.routes = mod.exports;
	}
})(this, function (module, express) {
	"use strict";

	var router = express.Router();

	router.get("/", function (req, res) {
		res.send("Hello world!");
	});

	module.exports = router;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3RmdWxsLWFwaS9yb3V0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBQXNCOzs7Ozs7Ozs7OzJCQUFsQjs7O0FBQ0osS0FBSSxTQUFTLFFBQVEsTUFBUixFQUFUOztBQUVKLFFBQU8sR0FBUCxDQUFXLEdBQVgsRUFBZ0IsVUFBUyxHQUFULEVBQWMsR0FBZCxFQUFrQjtBQUNqQyxNQUFJLElBQUosQ0FBUyxjQUFULEVBRGlDO0VBQWxCLENBQWhCOztBQUlBLFFBQU8sT0FBUCxHQUFpQixNQUFqQiIsImZpbGUiOiJyZXN0ZnVsbC1hcGkvcm91dGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxucm91dGVyLmdldChcIi9cIiwgZnVuY3Rpb24ocmVxLCByZXMpe1xuXHRyZXMuc2VuZChcIkhlbGxvIHdvcmxkIVwiKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
