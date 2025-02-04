
export type Mode = "words" | "quote" | "time";

export type Length = WordsLength | QuoteLength | TimeLength;
export type WordsLength = "10" | "25" | "50" | "100";
export type QuoteLength = "short" | "medium" | "long";
export type TimeLength = "15" | "30" | "60" | "120";
// export type TimeLength = "15s" | "30s" | "60s" | "120s";

export type Passage = {
  mode: Mode,
  length: Length,
  text: string[],
  by: string,
  context: string
}

