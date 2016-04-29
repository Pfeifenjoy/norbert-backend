/**
 * @author: Tobias Dorra
 */

import {Component} from './../core/component';
import {File, states} from './../core/file';

class DocumentComponent extends Component {

    constructor(dbObject) {
        super(dbObject);
        this.file = new File(this._data);
    }

    getText() {
        return '';
    }

    getFiles() {
        if (this.file.state === states.remote_file) {
            return [this.file];
        } else {
            return [];
        }
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
