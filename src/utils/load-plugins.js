
var loadPlugins = function (plugins) {
	// sync each information provider
	var result = {};
	for (var plugin of plugins) {
		var {name, object} = loadPlugin(plugin);
		result[name] = object;
	}
	return result;
};

var loadPlugin = function (plugin) {
	var pluginObject;
	if (plugin[0] == '.') {
		// require() a path name
		pluginObject = require(__dirname + '/../' + plugin);
	} else {
		// require() a global module
		pluginObject = require(plugin);	
	}

	var name = pluginObject.pluginName;
	return {"name": name, "object": pluginObject};
}

module.exports.loadPlugins = loadPlugins;
module.exports.loadPlugin = loadPlugin;

