/**
 * @author: Tobias Dorra
 */

import {Component} from './../core/component';

class NotificationComponent extends Component{

    constructor(dbObject) {
        super(dbObject);
        this._data.date = this._data.date || 0;
    }

    set date(value) {
        this._data.date = value;
    }

    get date() {
        return this._data.date;
    }

    getText() {
        return '';
    }

    getFiles() {
        return [];
    }

    getNotifications() {
         return [this._data.date];
    }

    getDataUserRepresentation() {
         return {
             date: this.date
         };
    }

    setDataUserRepresentation(obj) {
         this.date = obj.date || 0;
    }
}

module.exports = {
	"pluginName": 'components-notification',
	"pluginObject": NotificationComponent
};

