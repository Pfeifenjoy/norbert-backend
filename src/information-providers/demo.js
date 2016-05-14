/**
 * @author: Tobias Dorra
 */

import {ObjectID} from 'mongodb';
import {createComponent} from './../core/component';
import {Information} from './../core/information';

var sync = function(infoManager){

    // Create a description component and fill it with some text.
    let desc = createComponent('components-description');
    desc.text = "Ich bin eine Beschreibung!";

    // Add it to a new Information
    let info = new Information();
    info.title = "Hallo Universum!";
    info.components = [
        desc
    ];

    // Insert the Information into the database.
    let promise = infoManager.insert(info);

    // Always return a promise!
    return promise;

}

module.exports = {
	"pluginName": "info-provider-demo",
    "pluginObject": {
        "sync": sync
    }
};
