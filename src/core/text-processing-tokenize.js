/**
 * @author: Tobias Dorra
 */

/**
 * Tokenizes a string into its words.
 */
function tokenize(text) {
    let words = [];
    let regWord = /[a-z]+/ig;
    let match = regWord.exec(text);
    while (match) {
        words.push(match[0]);
        match = regWord.exec(text);
    }
    return words;
}

module.exports.tokenize = tokenize;

