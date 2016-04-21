/**
 * @author: Tobias Dorra
 */

import config from './../utils/configuration';
import {loadPlugins} from './../utils/load-plugins'

var configuredComponents = config.get('components');
var components = loadPlugins(configuredComponents);

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
    var type = dbObject.type;
    var ComponentClass = components[type];
    if (ComponentClass === undefined) {
        console.log('Could not load component: Unknown component type: ' + type);
        return undefined;
    } else {
        var component = new ComponentClass(dbObject);
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
    var ComponentClass = components[type];
    if (ComponentClass === undefined) {
        console.log('Could not create component: Unknown component type: ' + type);
        return undefined;
    } else {
        var dbObject = {
            "type": type,
            "generated": generated
        }
        return new ComponentClass(dbObject);
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
        this.obj = dbObject;

        this.obj.generated = this.obj.generated || false;

        this.obj.data = this.obj.data || {};
        this.data = dbObject.data;
    }

    get pluginName() {
         return this.obj['type'];
    }

    get dbRepresentation() {
        return this.obj;
    }

    get generated() {
        return this.obj.generated;
    }

    set generated(value) {
        this.obj.generated = value;
    }

}

module.exports.createComponent = createComponent;
module.exports.loadComponent = loadComponent;
module.exports.loadComponents = loadComponents;
module.exports.Component = Component;

