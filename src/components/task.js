import {Component} from './../core/component';

class TaskComponent extends Component{

    constructor(dbObject) {
        super(dbObject);
        this._data.text = this._data.text || "";
        this._data.checked = this._data.checked || false;
    }

    set text(text) {
        this._data.text = text;
    }

    get text() {
        return this._data.text;
    }

    set finished(finished) {
        this._data.finished = finished;
    }

    get finished() {
        return this._data.finished;
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
	"pluginName": 'components-task',
	"pluginObject": TaskComponent
};
