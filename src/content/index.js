var testWrapper = document.getElementById("test-wrapper");
var inputWrapper = document.getElementById("input-wrapper");
var userInputField = document.getElementById("user-text");
var displayedText = document.getElementById("start-text");
var resultsDisplay = document.getElementById("results");
var TEXT = "the quick brown fox jumps over the lazy dog";
// const TEXT = "www ww";
var WORDS = [];
var currentWord = 0;
var completedWord = -1;
var started = false;
var startTime;
/*
 * TestWord represents a word in the typing test
 * it contains the test word and the word that the user has input
 */
var TestWord = /** @class */ (function () {
    function TestWord(text, wordDomElem) {
        this.testText = text;
        this.userText = "";
        this.wordDomElem = wordDomElem;
        // this.domElements = [];
        for (var i = 0; i < text.length; i++) {
            var char = document.createElement("span");
            char.classList.add("char", "blank");
            char.innerText = text[i];
            // this.domElements.push(char);
            wordDomElem.appendChild(char);
        }
        var space = document.createElement("span");
        space.classList.add("char", "blank");
        space.innerText = ' ';
        this.trailingSpace = space;
        wordDomElem.appendChild(space);
    }
    TestWord.prototype.setCursor = function () {
        var _a;
        (_a = this.wordDomElem.children.item(this.userText.length)) === null || _a === void 0 ? void 0 : _a.classList.add('cursor');
        // if (pos === this.domElements.length) {
        //   this.trailingSpace.classList.add('cursor');
        //   return
        // }
        // this.domElements[pos].classList.add('cursor');
    };
    TestWord.prototype.setColors = function () {
        for (var i = 0; i < this.wordDomElem.children.length; i++) {
            var testChar = this.wordDomElem.children.item(i);
            if (!testChar) {
                break;
            }
            if (i >= this.userText.length) {
                testChar.classList.add("blank");
                testChar.classList.remove("correct", "incorrect", "excess");
                continue;
            }
            if (i >= this.testText.length) {
                testChar.classList.add("excess");
                testChar.classList.remove("correct", "incorrect", "blank");
                continue;
            }
            if (this.userText[i] === testChar.innerText) {
                testChar.classList.add("correct");
                testChar.classList.remove("blank", "incorrect", "excess");
            }
            else {
                testChar.classList.add("incorrect");
                testChar.classList.remove("blank", "correct", "excess");
            }
        }
    };
    TestWord.prototype.writeChar = function (char) {
        this.userText = this.userText.concat(char);
        if (this.userText.length > this.testText.length) {
            WORDS[currentWord].addExcessChar(char);
        }
    };
    TestWord.prototype.backspace = function () {
        if (this.userText !== "") {
            if (this.userText.length > this.testText.length) {
                WORDS[currentWord].removeExcessChar();
            }
            this.userText = this.userText.slice(0, -1);
            // console.log('bksp');
        }
        return;
    };
    /*
     * Check if word is complete
     * @return true if word is complete (user text matches test text)
     */
    TestWord.prototype.isComplete = function () {
        return this.userText === this.testText;
    };
    /*
     * Obtain stats of this word
     * @return counts of correct, incorrect, excess, missed
     */
    TestWord.prototype.wordStats = function () {
        var _a = [0, 0, 0, 0], correct = _a[0], incorrect = _a[1], excess = _a[2], missed = _a[3];
        var i = 0;
        for (; i < this.userText.length; i++) {
            if (i >= this.testText.length) {
                excess++;
            }
            if (this.userText[i] === this.testText[i]) {
                correct++;
            }
            else {
                incorrect++;
            }
        }
        for (; i < this.testText.length; i++) {
            missed++;
        }
        return [correct, incorrect, excess, missed];
    };
    TestWord.prototype.addExcessChar = function (char) {
        var charElem = document.createElement("span");
        charElem.classList.add("char", "blank");
        charElem.innerText = char;
        this.wordDomElem.insertBefore(charElem, this.wordDomElem.lastChild);
    };
    TestWord.prototype.removeExcessChar = function () {
        var _a, _b;
        (_b = (_a = this.wordDomElem.lastChild) === null || _a === void 0 ? void 0 : _a.previousSibling) === null || _b === void 0 ? void 0 : _b.remove();
    };
    return TestWord;
}());
//  ================================================================
var clearCursor = function () {
    var currCursor = document.querySelector(".cursor");
    if (currCursor) {
        currCursor.classList.remove("cursor");
    }
};
var setCursor = function () {
    clearCursor();
    WORDS[currentWord].setCursor();
};
var setColors = function () {
    WORDS.forEach(function (word) { return word.setColors(); });
};
var endTest = function () {
    // console.log("END");
    var elapsedTime = Date.now() - startTime;
    var results = calculateResults(WORDS, elapsedTime);
    // console.log(results);
    document.getElementById("wpm").innerText = "".concat(Math.round(results.wpm));
    document.getElementById("accuracy").innerText = "".concat(Math.round(results.accuracy * 100), "%");
    document.getElementById("raw-wpm").innerText = "".concat(Math.round(results.rawWpm));
    // (document.getElementById("chars-correct") as HTMLElement).innerText = `${results.correctChars}`
    // (document.getElementById("chars-incorrect") as HTMLElement).innerText = `${results.wpm} wpm`
    // (document.getElementById("chars-correct") as HTMLElement).innerText = `${results.wpm} wpm`
    // (document.getElementById("chars-correct") as HTMLElement).innerText = `${results.wpm} wpm`
    resultsDisplay.classList.remove("hidden");
    testWrapper.classList.add("hidden");
};
var updateWordCount = function () {
    var wordCountDisplay = document.getElementById("word-count");
    wordCountDisplay.innerText = "".concat(currentWord, "/").concat(WORDS.length);
};
var calculateResults = function (words, milliseconds) {
    // wpm = (characters_in_correct_words (with spaces) / 5 ) / 60 seconds
    // raw wpm = (characters_in_all_words (with spaces) / 5 ) / 60 seconds
    // accuracy = correct_key_presses / total_key_presses = correctChars / totalChars
    var correctWords = words.filter(function (word) { return word.isComplete(); });
    // Add correctWords.length - 1 for spaces
    var correctWordCharCount = correctWords
        .reduce(function (count, word) { return count + word.userText.length; }, 0) + correctWords.length - 1;
    // Add words.length - 1 for spaces
    var allWordCharCount = words.reduce(function (count, word) { return count + word.userText.length; }, 0) + words.length - 1;
    var seconds = milliseconds / 1000 / 60;
    var wpm = (correctWordCharCount / 5) / seconds;
    var rawWpm = (allWordCharCount / 5) / seconds;
    var _a = [0, 0, 0, 0], correctChars = _a[0], incorrectChars = _a[1], excessChars = _a[2], missingChars = _a[3];
    words.forEach(function (word) {
        var _a = word.wordStats(), correct = _a[0], incorrect = _a[1], excess = _a[2], missing = _a[3];
        correctChars += correct;
        incorrectChars += incorrect;
        excessChars += excess;
        missingChars += missing;
    });
    // don't count spaces?
    var accuracy = correctChars / (correctChars + incorrectChars + excessChars + missingChars);
    return {
        elapsedMs: milliseconds,
        wpm: Math.max(wpm, 0),
        rawWpm: Math.max(rawWpm, 0),
        accuracy: Math.max(accuracy, 0),
        correctChars: correctChars,
        incorrectChars: incorrectChars,
        excessChars: excessChars,
        missingChars: missingChars,
    };
};
// ========================================================================
userInputField.addEventListener("keydown", function (event) {
    // console.log(event);
    // prevent movement within input field
    var keyboardEvent = event;
    var key = keyboardEvent.key;
    if (key.includes('Arrow') || key === 'Delete') {
        event.preventDefault();
        return false;
    }
    // annoyingly, the input event doesn't fire on a bksp on an empty field
    // so process it in a keydown event
    if (key === 'Backspace' && currentWord - 1 > completedWord &&
        WORDS[currentWord].userText === "") {
        // console.log('move prev');
        currentWord -= 1;
        keyboardEvent.target.value = WORDS[currentWord].userText;
        setCursor();
        updateWordCount();
        event.preventDefault();
        return false;
    }
});
var processInput = function (event) {
    // console.log((event.target as HTMLTextAreaElement).value);
    // console.log(event);
    if (event.inputType === "deleteContentBackward") {
        WORDS[currentWord].backspace();
        return;
    }
    var data = event.data;
    if (!data) {
        return;
    }
    if (data !== ' ') {
        // start
        if (!started) {
            startTime = Date.now();
            started = true;
        }
        WORDS[currentWord].writeChar(data);
        // end
        if (currentWord === WORDS.length - 1 && WORDS[currentWord].isComplete()) {
            endTest();
        }
    }
    else {
        // end if space on last word
        if (currentWord === WORDS.length - 1) {
            endTest();
        }
        // compare this word with test word to see if it should be completed
        if (WORDS[currentWord].isComplete() && currentWord - 1 === completedWord) {
            // console.log('completed');
            completedWord += 1;
        }
        if (WORDS[currentWord].userText !== "") {
            // console.log('move next');
            currentWord += 1;
        }
        // no space as first char on a word
        event.target.value = "";
    }
};
userInputField.addEventListener("input", function (event) {
    processInput(event);
    // console.log(WORDS.map((word) => word.userText));
    setCursor();
    setColors();
    updateWordCount();
    // matchInputWithTest(userInputField.value, testText);
});
userInputField.addEventListener("blur", function (_) {
    clearCursor();
    // console.log("blur");
});
inputWrapper.addEventListener("click", function (_) {
    userInputField.focus();
    setCursor();
    // console.log("focus");
});
var initializeTest = function (text) {
    resultsDisplay.classList.add("hidden");
    text.split(' ').forEach(function (wordText) {
        var wordElem = document.createElement("span");
        wordElem.classList.add('word');
        var word = new TestWord(wordText, wordElem);
        WORDS.push(word);
        displayedText.appendChild(wordElem);
        // word.domElements.forEach((char) => displayedText.appendChild(char))
        // displayedText.appendChild(word.trailingSpace);
    });
    // remove trailing space
    // testText.removeChild(testText.children.item(testText.children.length - 1)!);
    updateWordCount();
    userInputField.focus();
};
initializeTest(TEXT);
