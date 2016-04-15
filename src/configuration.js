var fs = require('fs');
var clone = require('./utils/clone');

const configfile_path = './files/config/norbert-config.json';

/**
 * Returns the value found at the
 * given path in the object.
 */
var get_path_value = function(object, path = []) {
	if (path.length == 0) {
		return object;
	} else if (object === undefined){
		return undefined;
	} else {
		var path_head = path[0];
		var path_tail = path.slice(1);
		var sub_object = object[path_head];
		return get_path_value(sub_object, path_tail);
	}
};

/**
 * Read and parse a file containing some JSON
 * Returns the resulting Object.
 */
var load_json_file = function(path) {
	var file_contents = fs.readFileSync(path, 'utf8');
	return JSON.parse(file_contents);
};

/**
 * Persist an object to disk by using the
 * JSON format.
 */
var save_json_file = function(path, object) {
	var file_contents = JSON.stringify(object, null, 4);
	fs.writeFile(path, file_contents, function(err){
		if (err) {
			console.log("ERROR while writing the config file.");
		}
	});
};

/**
 * The object holding the actual configuration.
 */
var config = load_json_file(configfile_path);

/**
 * Get a value in the config.
 */
var get = function(str_path = ''){
	// Parse the path
	var path = str_path.split('.');

	// get the requested value
	var result = get_path_value(config, path);

	// return a copy
	return clone(result);
};

/**
 * Set a value in the config & save it.
 */
var set = function(str_path, value){
	// Parse the path
	var path = str_path.split('.');

	// Set value
	if (path.length == 0) {
		config = clone(value);
	} else {
		var path_body = path.slice(0, -1);
		var path_last = path[path.length - 1];
		var destination = get_path_value(config, path_body);
		destination[path_last] = clone(value);
	}

	// Save
	save_json_file(configfile_path, config);
};

module.exports = {
	"get": get,
	"set": set
};