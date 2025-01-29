import { Passage } from "../../src/shared/types"

const menu = (document.getElementById("menu") as HTMLElement);
const testWrapper = (document.getElementById("test-wrapper") as HTMLElement);
const inputWrapper = (document.getElementById("input-wrapper") as HTMLElement);
const userInputField = (document.getElementById("user-text") as HTMLFormElement);
const displayedText = (document.getElementById("start-text") as HTMLElement);
const resultsDisplay = (document.getElementById("results") as HTMLElement);

let WORDS: TestWord[] = [];
let LINES: TestWord[][];
let currentWord: number;
let completedWord: number;

let started: boolean;
let startTime: number;

let PASSAGE: Passage;

/**
 * TestWord represents a word in the typing test
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

  correctKeystrokes: number;
  totalKeystrokes: number;

  public constructor(text: string, wordDomElem: HTMLElement) {
    this.testText = text;
    this.userText = "";
    this.wordDomElem = wordDomElem;
    // this.domElements = [];
    this.correctKeystrokes = 0;
    this.totalKeystrokes = 0;

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

  public hide() { this.wordDomElem.classList.add("hidden"); }

  public show() { this.wordDomElem.classList.remove("hidden"); }

  /**
   * Write a character in this word
   * @param char to be written
   * @return true if an excess char was written
   */
  public writeChar(char: string): boolean {
    this.userText = this.userText.concat(char);
    this.totalKeystrokes += 1;

    if (this.userText.length > this.testText.length) {
      WORDS[currentWord].addExcessChar(char);
      return true;
    } else if (char === this.testText.charAt(this.userText.length - 1)) {
      this.correctKeystrokes += 1;
    }
    return false;
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

  /**
   * Resets word to empty
   */
  public reset() {
    this.userText = "";
  }

  /**
   * Check if word is complete
   * @return true if word is complete (user text matches test text)
   */
  public isComplete() {
    return this.userText === this.testText;
  }

  /**
   * Obtain character stats of this word
   * @return counts of correct, incorrect, excess, missed characters
   */
  public characterStats() {
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

  /**
   * Obtain keystroke stats of this word
   * @return counts of correct, total keystrokes
   */
  public keystrokeStats() {
    return [this.correctKeystrokes, this.totalKeystrokes];
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

const wordCountDisplay = (document.getElementById("word-count") as HTMLElement)
const updateWordCount = function() {
  wordCountDisplay.innerText = `${currentWord}/${WORDS.length}`
};

const updateDisplay = function() {
  setCursor();
  setColors();
  updateWordCount();
}


const endTest = function() {
  // console.log("END");

  const elapsedTime = Date.now() - startTime;
  const results = calculateResults(WORDS, elapsedTime);
  // console.log(results);
  (document.getElementById("wpm") as HTMLElement).innerText = `${Math.round(results.wpm)}`;
  (document.getElementById("accuracy") as HTMLElement).innerText = `${Math.round(results.accuracy * 100)}%`;
  (document.getElementById("elapsed-time") as HTMLElement).innerText = `${(results.elapsedMs / 1000).toFixed(1)}`;
  (document.getElementById("raw-wpm") as HTMLElement).innerText = `${Math.round(results.rawWpm)}`;

  (document.getElementById("test-type") as HTMLElement).innerText = `${PASSAGE.mode} - ${PASSAGE.length}`;
  if (PASSAGE.mode === "quote") {
    const sourceElem = document.getElementById("source") as HTMLElement;
    sourceElem.innerText = PASSAGE.by;
    if (PASSAGE.context.length > 0) {
      sourceElem.innerText += PASSAGE.context;
    }

    (document.getElementById("test-source") as HTMLElement).classList.remove("hidden");
  }

  resultsDisplay.classList.remove("hidden");
  testWrapper.classList.add("hidden");
  menu.classList.add("hidden");
}

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
  // accuracy = correct_keystrokes / total_keystrokes

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
  let [correctKeystrokes, totalKeystrokes] = [0, 0];
  words.forEach((word) => {
    const [correct, incorrect, excess, missing] = word.characterStats();
    correctChars += correct;
    incorrectChars += incorrect;
    excessChars += excess;
    missingChars += missing;

    const [correctKeys, totalKeys] = word.keystrokeStats();
    correctKeystrokes += correctKeys;
    totalKeystrokes += totalKeys;
  });

  // don't count spaces?
  const accuracy = correctKeystrokes / totalKeystrokes;

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

    displayLines();

    event.preventDefault();
    return false;
  }

});

const processInput = function(event: InputEvent) {
  if (event.inputType === "deleteContentBackward") {
    WORDS[currentWord].backspace();
    createLines();
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
    const recreateLines = WORDS[currentWord].writeChar(data);
    if (recreateLines) {
      createLines();
    }

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

    // don't allow space as first char on a word
    (event.target as HTMLTextAreaElement).value = "";
  }
}

userInputField.addEventListener("input", (event) => {
  processInput(event as InputEvent);

  displayLines();
  updateDisplay();
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

// on viewport change, we need to re-create/display the lines
addEventListener("resize", (_) => {
  createLines();
  displayLines();
});

const createLines = function() {
  // temporarily unhide all words so getBoundingClientRect() works properly
  WORDS.forEach((word) => { word.show(); });

  LINES = [[]];
  let currLineY = WORDS[0].wordDomElem.getBoundingClientRect().y;
  WORDS.forEach((word) => {
    if (Math.abs(word.wordDomElem.getBoundingClientRect().y - currLineY) > 0.001) {
      currLineY = word.wordDomElem.getBoundingClientRect().y;
      LINES.push([]);
    }
    LINES[LINES.length - 1].push(word);
  });
  // console.log(LINES);
}

const displayLines = function() {
  let currentLine = 0;
  let seenWords = 0;
  for (let i = 0; i < LINES.length; i++) {
    seenWords += LINES[i].length;
    if (seenWords > currentWord) {
      currentLine = i;
      break;
    }
    currentLine += 1;
  }

  // on middle line, show prev and next line
  let showPredicate = (i: number) => (i >= currentLine - 1 && i <= currentLine + 1);
  // on first line, show next 2 lines
  if (currentLine === 0) {
    showPredicate = (i: number) => (i >= currentLine && i <= currentLine + 2);
  }
  // on last line, show prev 2 lines
  else if (currentLine === LINES.length - 1) {
    showPredicate = (i: number) => (i >= currentLine - 2 && i <= currentLine);
  }

  LINES.forEach((line, i) => {
    if (showPredicate(i)) {
      line.forEach((word) => { word.show() });
    } else {
      line.forEach((word) => { word.hide() });
    }
  });
}

export function initializeTest(passage: Passage) {
  WORDS = [];
  PASSAGE = passage;
  LINES = [];

  displayedText.innerText = "";

  passage.text.forEach((wordText: string) => {
    const wordElem = document.createElement("span");
    wordElem.classList.add('word');

    const word = new TestWord(wordText, wordElem);
    WORDS.push(word);

    displayedText.appendChild(wordElem);
  });

  currentWord = 0;
  completedWord = -1;
  started = false;

  updateDisplay();
  resultsDisplay.classList.add("hidden");
  testWrapper.classList.remove("hidden");
  menu.classList.remove("hidden");
  userInputField.focus();

  createLines();
  displayLines();
}

export function resetOrRestartTest() {
  initializeTest(PASSAGE);
}

