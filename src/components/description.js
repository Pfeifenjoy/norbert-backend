import {Component} from './../core/components';

class DescriptionComponent extends Component{

    constructor(dbObject) {
        super(dbObject);
        this._data.text = this._data.text || "";
    }

    set description(text) {
        this._data.text = text;
    }

    get description() {
        return this._data.text;
    }

    getText() {
        return this.description;
    }

    getFiles() {
        return [];
    }
}

module.exports = {
	"pluginName": 'components-description',
	"pluginObject": DescriptionComponent
};

