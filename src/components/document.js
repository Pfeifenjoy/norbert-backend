/**
 * @author: Tobias Dorra
 */

import {Component} from './../core/component';
import {File} from './../core/file';

class DocumentComponent extends Component {

    constructor(dbObject) {
        super(dbObject);
        this.file = new File(this._data);
    }

    getText() {
        return '';
    }

    getFiles() {
        if (this._data.where == remote_file) {
            return [this._data.file];
        } else {
            return [];
        }
    }

    getDataDbRepresentation() {
        return this.file.dbRepresentation;
    }

    getNotifications() {
      return [];
    }
}

module.exports = {
	"pluginName": 'components-document',
	"pluginObject": DocumentComponent
};
