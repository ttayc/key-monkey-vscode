
export const updateWordCount = function() {
  const wordCountDisplay = (document.getElementById("word-count") as HTMLElement)
  wordCountDisplay.innerText = `${currentWord}/${WORDS.length}`
};

export const calculateWpm = function(numWords: number, milliseconds: number) {
  return numWords / (milliseconds / 1000 / 60);
}
