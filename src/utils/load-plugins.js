/**
 * @author: Tobias Dorra
 */

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
    if (/^\./.test(plugin)) {
		// require() a path name
		pluginObject = require(__dirname + '/../' + plugin);
	} else {
		// require() a global module
		pluginObject = require(plugin);	
	}

	var name = pluginObject.pluginName;
    var object = pluginObject.pluginObject;
	return {"name": name, "object": object};
}

module.exports.loadPlugins = loadPlugins;
module.exports.loadPlugin = loadPlugin;

