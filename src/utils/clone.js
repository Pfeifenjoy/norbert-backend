/**
 * @author: Tobias Dorra
 */

/**
 * Clones a value.
 * A deep copy will be performed on the given value. The copy will be returned.
 */
var clone = function(value) {
	if (value === undefined) {
		return undefined;
	} else {
		// This ugly way of creating a deep copy of something 
		// was not my own invention!!!!
		// It actually seems to be quite comon in the 
		// strange javascript world to do it like this.
		return JSON.parse(JSON.stringify(value));		
	}
};

module.exports = clone;