/**
 * @author Tobias Dorra
 */

/**
 * A utitlty function that takes a promise and
 * returns a promise that gets resolved as soon as
 * the given promise gets eather resolved or rejected.
 */
function after(promise) {
    return new Promise((resolve, reject) => {
        return promise.then(resolve, resolve.bind(undefined, null));
    });
}

module.exports.after = after;
