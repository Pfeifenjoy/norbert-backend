import {Component} from './../core/component';

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
        return this.text;
    }

    getFiles() {
        return [];
    }

    getNotifications() {
         return [];
    }

    getDataUserRepresentation() {
         return {
             text: this.text
         };
    }

    setDataUserRepresentation(obj) {
         this.text = obj.text || '';
    }
}

module.exports = {
	"pluginName": 'components-description',
	"pluginObject": DescriptionComponent
};
