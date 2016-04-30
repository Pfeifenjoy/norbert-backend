
function findFirst(word, search, start = 0) {
    for (let it = start; it < word.length; ++it) {
        if (search(word[it])) return it;
    }
    return word.length;
}

/**
 * Stemms a word and returns the result.
 *
 * The algorithm used is the german port stemmer described here: 
 * http://snowballstem.org/algorithms/german/stemmer.html
 */
function stemm(word) {
    let vowels   = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö', 'ü'];
    let sEnding  = ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'r', 't'];
    let stEnding = ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 't'];

    word = word.toLowerCase();
    word = word.replace('ß', 'ss');

    // put u and y between vowels into upper case.
    for (let [search, replace] of [['u', 'U'], ['y', 'Y']]) {
        let split = word.split(search);
        word = '';
        for (let it = 0; it < split.length - 1 ; ++it) {
            let before = split[it];
            let after = split[it + 1];
            word = word + before;
            let lastBefore = word[word.length - 1];
            let firstAfter = after[0];
            if (lastBefore 
                    && firstAfter 
                    && vowels.indexOf(lastBefore) >= 0 
                    && vowels.indexOf(firstAfter) >= 0) {
                word = word + replace;
            } else {
                word = word + search;
            }
        }
        word = word + split[split.length - 1];
    }

    // Calculate R1 and R2.
    let firstVowel =         findFirst(word, ch => vowels.indexOf(ch) >=  0);
    let firstVowelNonVowel = findFirst(word, ch => vowels.indexOf(ch) == -1, firstVowel);
    let R1 = firstVowelNonVowel + 1;
    let R1FirstVowel         = findFirst(word, ch => vowels.indexOf(ch) >=  0, R1);
    let R1FirstVowelNonVowel = findFirst(word, ch => vowels.indexOf(ch) == -1, R1FirstVowel);
    let R2 = R1FirstVowelNonVowel + 1;
    if (R1 <3 ) R1 = 3;
    let R1len = word.length - R1;
    let R2len = word.length - R2;

    // Do Step 1
    let s1g3Suffixes = sEnding.map(pre => pre + 's');
    let s1RemoveChars = 0;
    let s1MinR1Len = 0;
    if (word.endsWith('ern')) {
        s1RemoveChars = 3;
        s1MinR1Len = 3;
    } else if (word.endsWith('em') || word.endsWith('er')) {
        s1RemoveChars = 2;
        s1MinR1Len = 2;
    } else if (word.endsWith('nissen') || word.endsWith('nisses')) {
        s1RemoveChars = 3;
        s1MinR1Len = 2;
    } else if (word.endsWith('en') || word.endsWith('es')) {
        s1RemoveChars = 2;
        s1MinR1Len = 2;
    } else if (s1g3Suffixes.filter(s => word.endsWith(s)).length > 0) {
        s1RemoveChars = 1;
        s1MinR1Len = 1;
    } else if (word.endsWith('nisse')) {
        s1RemoveChars = 2;
        s1MinR1Len = 1;
    } else if (word.endsWith('e')) {
        s1RemoveChars = 1;
        s1MinR1Len = 1;
    }
    if (s1RemoveChars > 0 && R1len >= s1MinR1Len) {
        word = word.slice(0, -s1RemoveChars);
        R1len = R1len - s1RemoveChars;
        R2len = R2len - s1RemoveChars;
    }

    // Do Step 2
    let s2RemoveChars = 0;
    let s2_st = stEnding.map(st => st + 'st');
    if (word.endsWith('est')) {
        s2RemoveChars = 3;
    } else if (word.endsWith('en') || word.endsWith('er')) {
        s2RemoveChars = 2;
    } else if (s2_st.filter(s => word.endsWith(s)).length > 0 && word.length >= 6) {
        s2RemoveChars = 2;
    }
    if (s2RemoveChars > 0 && R1len >= s2RemoveChars) {
        word = word.slice(0, -s2RemoveChars);
        R1len = R1len - s2RemoveChars;
        R2len = R2len - s2RemoveChars;
    }

    // Do Step 3
    let s3RemoveChars = 0;
    if (word.endsWith('isch')) {
        if (R2len >= 4 && !word.endsWith('eisch')) {
            word = word.slice(0, -4);
        }
    } else if (word.endsWith('lich') || word.endsWith('heit')) {
        if (R2len >= 4) {
            word = word.slice(0, -4);
            if ((word.endsWith('er') || word.endsWith('en')) && R1len >= 6) {
                 word = word.slice(0, -2);
            }
        }
    } else if (word.endsWith('keit')) {
        if (R2len >= 4) {
            word = word.slice(0, -4);
            if (word.endsWith('lich') && R2len >= 8) {
                word = word.slice(0, -4);
            }
            if (word.endsWith('ig')   && R2len >= 6) {
                word = word.slice(0, -2);
            }
        }
    } else if (word.endsWith('end') || word.endsWith('ung')) {
        if (R2len >= 3) {
            word = word.slice(0, -3);
            if (word.endsWith('ig') && R2len >= 5 && !word.endsWith('eig')) {
                word = word.slice(0, -2);
            }
        }
    } else if (word.endsWith('ig') || word.endsWith('ik')) {
        if (R2len >= 2 && word.slice(-3, -2) != 'e') {
            word = word.slice(0, -2);
        }
    }

    // finalie
    word = word.toLowerCase();
    word = word.replace(/ä/g, 'a');
    word = word.replace(/ö/g, 'o');
    word = word.replace(/ü/g, 'u');

    return word;
}

module.exports.stemm = stemm;
