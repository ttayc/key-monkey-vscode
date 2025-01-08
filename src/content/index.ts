const testWrapper = (document.getElementById("test-wrapper") as HTMLElement);
const inputWrapper = (document.getElementById("input-wrapper") as HTMLElement);
const userInputField = (document.getElementById("user-text") as HTMLFormElement);
const displayedText = (document.getElementById("start-text") as HTMLElement);
const resultsDisplay = (document.getElementById("results") as HTMLElement);

const TEXT = ["the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"];
const WORDS: TestWord[] = [];
let currentWord = 0;
let completedWord = -1;

let started = false;
let startTime: number;

/*
 * TestWord represents a word in the typing test
 * it contains the test word and the word that the user has input
 */
class TestWord {
  wordDomElem: HTMLElement;

  // the intended text of this word
  testText: string;

  // the user's text for this word
  userText: string;

  // HTMLElements to render text, may contain extra chars based on user input
  // domElements: HTMLElement[];
  trailingSpace: HTMLElement;

  public constructor(text: string, wordDomElem: HTMLElement) {
    this.testText = text;
    this.userText = "";
    this.wordDomElem = wordDomElem;
    // this.domElements = [];

    for (let i = 0; i < text.length; i++) {
      const char = document.createElement("span");
      char.classList.add("char", "blank");
      char.innerText = text[i];

      // this.domElements.push(char);
      wordDomElem.appendChild(char);
    }

    const space = document.createElement("span");
    space.classList.add("char", "blank");
    space.innerText = ' ';
    this.trailingSpace = space
    wordDomElem.appendChild(space);
  }


  public setCursor() {
    this.wordDomElem.children.item(this.userText.length)?.classList.add('cursor');
    // if (pos === this.domElements.length) {
    //   this.trailingSpace.classList.add('cursor');
    //   return
    // }
    // this.domElements[pos].classList.add('cursor');
  }

  public setColors() {
    for (let i = 0; i < this.wordDomElem.children.length; i++) {
      const testChar = this.wordDomElem.children.item(i);
      if (!testChar) { break; }

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
      if (this.userText[i] === (testChar as HTMLElement).innerText) {
        testChar.classList.add("correct");
        testChar.classList.remove("blank", "incorrect", "excess");
      } else {
        testChar.classList.add("incorrect");
        testChar.classList.remove("blank", "correct", "excess");
      }
    }
  }

  public writeChar(char: string) {
    this.userText = this.userText.concat(char);

    if (this.userText.length > this.testText.length) {
      WORDS[currentWord].addExcessChar(char);
    }
  }

  public backspace() {
    if (this.userText !== "") {

      if (this.userText.length > this.testText.length) {
        WORDS[currentWord].removeExcessChar();
      }

      this.userText = this.userText.slice(0, -1);

      // console.log('bksp');
    }
    return;
  }

  /*
   * Check if word is complete
   * @return true if word is complete (user text matches test text)
   */
  public isComplete() {
    return this.userText === this.testText;
  }

  /*
   * Obtain stats of this word
   * @return counts of correct, incorrect, excess, missed
   */
  public wordStats() {
    let [correct, incorrect, excess, missed] = [0, 0, 0, 0];
    let i = 0;
    for (; i < this.userText.length; i++) {
      if (i >= this.testText.length) {
        excess++;
      }
      if (this.userText[i] === this.testText[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }
    for (; i < this.testText.length; i++) {
      missed++;
    }

    return [correct, incorrect, excess, missed];
  }

  private addExcessChar(char: string) {
    const charElem = document.createElement("span");
    charElem.classList.add("char", "blank");
    charElem.innerText = char;
    this.wordDomElem.insertBefore(charElem, this.wordDomElem.lastChild)
  }

  private removeExcessChar() {
    this.wordDomElem.lastChild?.previousSibling?.remove();
  }

}

//  ================================================================

const clearCursor = function() {
  const currCursor = document.querySelector(".cursor");
  if (currCursor) {
    currCursor.classList.remove("cursor");
  }
};

const setCursor = function() {
  clearCursor();
  WORDS[currentWord].setCursor()
};

const setColors = function() {
  WORDS.forEach((word) => word.setColors());
};

const endTest = function() {
  // console.log("END");

  const elapsedTime = Date.now() - startTime;
  const results = calculateResults(WORDS, elapsedTime);
  // console.log(results);
  (document.getElementById("wpm") as HTMLElement).innerText = `${Math.round(results.wpm)}`;
  (document.getElementById("accuracy") as HTMLElement).innerText = `${Math.round(results.accuracy * 100)}%`;
  (document.getElementById("raw-wpm") as HTMLElement).innerText = `${Math.round(results.rawWpm)}`;
  // (document.getElementById("chars-correct") as HTMLElement).innerText = `${results.correctChars}`
  // (document.getElementById("chars-incorrect") as HTMLElement).innerText = `${results.wpm} wpm`
  // (document.getElementById("chars-correct") as HTMLElement).innerText = `${results.wpm} wpm`
  // (document.getElementById("chars-correct") as HTMLElement).innerText = `${results.wpm} wpm`
  resultsDisplay.classList.remove("hidden");
  testWrapper.classList.add("hidden");
}

const updateWordCount = function() {
  const wordCountDisplay = (document.getElementById("word-count") as HTMLElement)
  wordCountDisplay.innerText = `${currentWord}/${WORDS.length}`
};


type TestResults = {
  elapsedMs: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  excessChars: number;
  missingChars: number;
}

const calculateResults = function(words: TestWord[], milliseconds: number): TestResults {
  // wpm = (characters_in_correct_words (with spaces) / 5 ) / 60 seconds
  // raw wpm = (characters_in_all_words (with spaces) / 5 ) / 60 seconds
  // accuracy = correct_key_presses / total_key_presses = correctChars / totalChars

  const correctWords = words.filter((word) => word.isComplete())
  // Add correctWords.length - 1 for spaces
  const correctWordCharCount = correctWords
    .reduce((count, word) => count + word.userText.length, 0) + correctWords.length - 1;

  // Add words.length - 1 for spaces
  const allWordCharCount =
    words.reduce((count, word) => count + word.userText.length, 0) + words.length - 1;
  const seconds = milliseconds / 1000 / 60;
  const wpm = (correctWordCharCount / 5) / seconds
  const rawWpm = (allWordCharCount / 5) / seconds

  let [correctChars, incorrectChars, excessChars, missingChars] = [0, 0, 0, 0];
  words.forEach((word) => {
    const [correct, incorrect, excess, missing] = word.wordStats();
    correctChars += correct;
    incorrectChars += incorrect;
    excessChars += excess;
    missingChars += missing;
  });

  // don't count spaces?
  const accuracy = correctChars / (correctChars + incorrectChars + excessChars + missingChars);

  return {
    elapsedMs: milliseconds,
    wpm: Math.max(wpm, 0),
    rawWpm: Math.max(rawWpm, 0),
    accuracy: Math.max(accuracy, 0),
    correctChars: correctChars,
    incorrectChars: incorrectChars,
    excessChars: excessChars,
    missingChars: missingChars,
  }
}

// ========================================================================


userInputField.addEventListener("keydown", (event) => {
  // console.log(event);

  // prevent movement within input field
  const keyboardEvent = event as KeyboardEvent
  const key = keyboardEvent.key;
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
    (keyboardEvent.target as HTMLTextAreaElement).value = WORDS[currentWord].userText;

    setCursor();
    updateWordCount();

    event.preventDefault();
    return false;
  }

});

const processInput = function(event: InputEvent) {
  // console.log((event.target as HTMLTextAreaElement).value);
  // console.log(event);

  if (event.inputType === "deleteContentBackward") {
    WORDS[currentWord].backspace();
    return;
  }

  const data = event.data;
  if (!data) { return; }

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

  } else {
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
    (event.target as HTMLTextAreaElement).value = "";

  }
}

userInputField.addEventListener("input", (event) => {
  processInput(event as InputEvent);

  // console.log(WORDS.map((word) => word.userText));

  setCursor();
  setColors();
  updateWordCount();
  // matchInputWithTest(userInputField.value, testText);
});

userInputField.addEventListener("blur", (_) => {
  clearCursor();
  // console.log("blur");
});

inputWrapper.addEventListener("click", (_) => {
  userInputField.focus();
  setCursor();
  // console.log("focus");
});


const initializeTest = function(text: string[]) {
  resultsDisplay.classList.add("hidden");

  text.forEach((wordText) => {
    const wordElem = document.createElement("span");
    wordElem.classList.add('word');

    const word = new TestWord(wordText, wordElem);
    WORDS.push(word);

    displayedText.appendChild(wordElem);

    // word.domElements.forEach((char) => displayedText.appendChild(char))
    // displayedText.appendChild(word.trailingSpace);
  });

  // remove trailing space
  // testText.removeChild(testText.children.item(testText.children.length - 1)!);

  updateWordCount();
  userInputField.focus();
}

initializeTest(TEXT);

