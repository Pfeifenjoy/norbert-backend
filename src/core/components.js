/**
 * @author: Tobias Dorra
 */

import config from './../utils/configuration';
import {loadPlugins} from './../utils/load-plugins'

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
    if (dbObject instanceof Component)
    {
        return dbObject;
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
    }

    get pluginName() {
         return this._obj['type'];
    }

    get dbRepresentation() {
        return this._obj;
    }

    get generated() {
        return this._obj.generated;
    }

    set generated(value) {
        this._obj.generated = value;
    }

}

module.exports.createComponent = createComponent;
module.exports.loadComponent = loadComponent;
module.exports.loadComponents = loadComponents;
module.exports.Component = Component;

