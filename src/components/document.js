/**
 * @author: Tobias Dorra
 */

import {Component} from './../core/component';
import {File, states} from './../core/file';

class DocumentComponent extends Component {

    constructor(dbObject) {
        super(dbObject);
        this._file = new File(this._data);
    }

    get file() {
        return this._file;
    }
    set file(file) {
        this._file = file;
    }
    getText() {
        return '';
    }

    getFiles() {
        return [this.file];
    }

    getNotifications() {
      return [];
    }

    getDataDbRepresentation() {
        return this.file.dbRepresentation;
    }

    getDataUserRepresentation() {
        return {
            processing: (this.file.state != states.remote_file),
            name: this.file.originalFileName,
            url: this.file.getUrl()
        };
    }

    setDataUserRepresentation(obj) {
        this.file.originalFileName = obj.name || '';
    }
}

module.exports = {
	"pluginName": 'components-document',
	"pluginObject": DocumentComponent
};
