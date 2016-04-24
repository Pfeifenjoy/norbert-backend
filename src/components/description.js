import {Component} from './../core/components';

class DescriptionComponent extends Component{

    constructor(dbObject) {
        super(dbObject);
        this._data.text = this._data.text || "";
    }

    set text(text) {
        this._data.text = text;
    }

    get text() {
        return this._data.text;
    }

    getText() {
        return this.description;
    }

    getFiles() {
        return [];
    }

    getNotifications() {
         return [];
    }
}

module.exports = {
	"pluginName": 'components-description',
	"pluginObject": DescriptionComponent
};
