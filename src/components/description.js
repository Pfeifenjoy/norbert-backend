const pluginName = "components-text";

const defaultObj = {
	"text": ""
};

var descriptionComponent = function(obj){
	this.obj = Object.assign({}, defaultObj, obj);
};


descriptionComponent.prototype.setText = function(text) {
	this.obj.text = text;
};

descriptionComponent.prototype.getText = function() {
	return text;
};

descriptionComponent.prototype.getPluginName = function(){
	// the plugin name of this component
	return pluginName;
};

descriptionComponent.prototype.getDbRepresentation = function() {
	// returns the object that should be persisted in the DB.
	return this.obj;
}

descriptionComponent.prototype.getComponentText = function() {
	// gibt den Text für die Suche & das Clustering zurück
	return this.obj.text;
};

descriptionComponent.prototype.getFiles = function() {
	// gibt die Dateien der Komponente zurück.
	// (Die zurückgegebenen Objekte werden so, wie sie sind
	// an den storage provider weitergegeben, um die Datei herunterzuladen.)
	return [];
}

module.exports = {
	"pluginName": pluginName,
	"componentClass": descriptionComponent
};