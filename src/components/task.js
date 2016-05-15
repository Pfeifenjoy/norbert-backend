/**
 * @author Arwed Mett
 */
import {Component} from './../core/component';

class TaskComponent extends Component{

    constructor(dbObject) {
        super(dbObject);
        this._data.text = this._data.text || "";
        this._data.finished = this._data.finished || false;
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
            text: this.text,
            finished: this.finished
        };
    }

    setDataUserRepresentation(obj) {
        this.text = obj.text || '';
        this.finished = obj.finished || false;
    }
}

module.exports = {
	"pluginName": 'components-task',
	"pluginObject": TaskComponent
};
