type Mode = "words" | "quote" | "time";

type Length = WordsLength | QuoteLength | TimeLength;
type WordsLength = "10" | "25" | "50" | "100";
type QuoteLength = "short" | "medium" | "long";
type TimeLength = "15s" | "30s" | "60s" | "120s";

