/**
 * @author: Tobias Dorra
 */

import config from './../utils/configuration';
import {loadPlugins} from './../utils/load-plugins'
import { ObjectID } from 'mongodb';

var componentsCache;
var getComponentPlugins = function(){
    if (componentsCache === undefined) {
        var configuredComponents = config.get('components');
        componentsCache = loadPlugins(configuredComponents);
    }
    return componentsCache;
};

var checkComponent = function(component) {
    if (!(component instanceof Component)) {
        console.log("All component classes must derive from 'Component'.");
        console.log("Go and fix your code, then try again!");
        throw "Confused programmer.";
    }
}

/**
 * Loads a single component.
 *
 * dbObject: The representation of the
 *      component from the database.
 *
 * returns: The component object,
 *      or undefined if no component
 *      type could be found for the
 *      component type given in dbObject.
 */
var loadComponent = function (dbObject) {

    // It is already a component?
    // --> create a copy so that the old object
    //     does not influence the new object
    if (dbObject instanceof Component)
    {
        dbObject = Object.assign({}, dbObject.dbRepresentation);
    }

    var components = getComponentPlugins();
    var type = dbObject.type;
    var ComponentClass = components[type];
    if (ComponentClass === undefined) {
        console.log('Could not load component: Unknown component type: ' + type);
        return undefined;
    } else {
        var component = new ComponentClass(dbObject);
        checkComponent(component);
        return component;
    }
};

/**
 * Loads multiple components, just like loadComponent.
 */
var loadComponents = function(dbObjects) {
    return dbObjects.map(dbObj => loadComponent(dbObj));
}

/**
 * Creates a new Component
 * 
 * type: the component type to use
 *
 * returns: the newly created component
 */
var createComponent = function(type, generated=false) {
    var components = getComponentPlugins();
    var ComponentClass = components[type];
    if (ComponentClass === undefined) {
        console.log('Could not create component: Unknown component type: ' + type);
        return undefined;
    } else {
        var dbObject = {
            "type": type,
            "generated": generated
        }
        var result = new ComponentClass(dbObject);
        checkComponent(result);
        return result;
    }
}

/**
 * A component.
 *
 * DO NOT USE THIS CLASS DIRECTLY!
 * IN JAVA OR C++ IT WOULD BE ABSTRACT!
 *
 * If you simply want to convert a
 * Component object from the DB into
 * a proper Javascript thingie with
 * a proper, well defined Interface,
 * you can use the loadComponent() function.
 *
 * If you simply want to create a new component,
 * you can use the createComponent() function.
 */
class Component {

    /**
     * Creates a new component.
     *
     * dbObject: The representation of the
     *      Component from the database.
     *      Use {} for completely new objects.
     */
    constructor(dbObject) {
        this._obj = dbObject;
        this._obj.generated = this._obj.generated || false;
        this._obj.id = dbObject.id || new ObjectID();
        this._obj.data = this._obj.data || {};
        this._data = dbObject.data;

        // poor man's virtual methods...
        if (typeof this.getText !== 'function') {
            console.log('The function "getText" needs to be implemented for every component class.');
            console.log('Fix your code and try again!');
            process.exit(1);
        }
        if (typeof this.getFiles !== 'function') {
            console.log('The function "getFiles" needs to be implemented for every component class.');
            console.log('Fix your code and try again!');
            process.exit(1);
        }
        if (typeof this.getNotifications !== 'function') {
            console.log('The function "getNotifications" needs to be implemented for every component class.');
            console.log('Fix your code and try again!');
            process.exit(1);
        }
        if (typeof this.getDataUserRepresentation !== 'function') {
            console.log('The function "getDataUserRepresentation" needs to be implemented for every component class.');
            console.log('Fix your code and try again!');
            process.exit(1);
        }
        if (typeof this.setDataUserRepresentation !== 'function') {
            console.log('The function "setDataUserRepresentation" needs to be implemented for every component class.');
            console.log('Fix your code and try again!');
            process.exit(1);
        }
    }

    /**
     * The name of the actual component type plug in
     */
    get pluginName() {
         return this._obj['type'];
    }

    /**
     * A unique ID of the component
     */
    get id() {
        return this._obj.id;
    }

    /**
     * Was the component generated automatically? (e.g. by extracting information from a text)
     */
    get generated() {
        return this._obj.generated;
    }

    set generated(value) {
        this._obj.generated = value;
    }

    /**
     * The representation of the component in the database.
     */
    get dbRepresentation() {
        if (typeof this.getDataDbRepresentation == 'function') {
            this._obj.data = this.getDataDbRepresentation();
            this._data = this._obj.data;
        }
        return this._obj;
    }

    /**
     * The representation of the component that can be sent to 
     * a user. (e.G. over the RESTful API.)
     * Internal information will be stripped out of the returned
     * object.
     */
    get userRepresentation() {
        let result = {};
        result['type'] = this.pluginName;
        result['data'] = this.getDataUserRepresentation();
        result['id'] = this.id;
        return result;
    }

    set userRepresentation(obj) {
        if (obj.data)   this.setDataUserRepresentation(obj.data);
    }

}

module.exports.createComponent = createComponent;
module.exports.loadComponent = loadComponent;
module.exports.loadComponents = loadComponents;
module.exports.Component = Component;
