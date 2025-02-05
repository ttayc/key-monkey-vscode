import { Uri, workspace } from "vscode";
// import { Passage, Mode, Length } from "./types"
import { Passage, Mode, Length } from "@extension/types";

type WordsCache = Record<string, string[]>;
let wordsCache: WordsCache | null = null;

type QuoteObject = { text: string; by: string; context: string };
type QuotesCache = Record<string, QuoteObject[]>;
let quotesCache: QuotesCache | null = null;

// export type Passage = {
//   mode: string,
//   length: string,
//   text: string[],
//   by: string,
//   context: string
// }

export async function getPassage(
  extensionUri: Uri,
  mode: Mode,
  length: Length
): Promise<Passage> {
  let text: string[] = [];
  let by = "";
  let context = "";

  let path: Uri;
  let raw: Uint8Array<ArrayBufferLike>;
  let contents: string;

  switch (mode) {
    case "words":
      if (!wordsCache) {
        path = Uri.joinPath(extensionUri, "passages", "words.json");
        raw = await workspace.fs.readFile(path);
        contents = Buffer.from(raw).toString("utf8");
        wordsCache = JSON.parse(contents);
      }
      if (wordsCache) { // should always be true, here to please the lsp
        const wordBank: string[] = wordsCache[mode];

        const indices: Set<number> = new Set();
        while (indices.size < parseInt(length)) {
          indices.add(Math.floor(Math.random() * wordBank.length));
        }

        for (let idx of indices) {
          text.push(wordBank[idx]);
        }
      }

      break;
    case "time":
      if (!wordsCache) {
        path = Uri.joinPath(extensionUri, "passages", "words.json");
        raw = await workspace.fs.readFile(path);
        contents = Buffer.from(raw).toString("utf8");
        wordsCache = JSON.parse(contents);
      }

      if (wordsCache) { // should always be true, here to please the lsp
        const wordBank: string[] = wordsCache["words"];

        const indices: number[] = [];
        while (indices.length < parseInt(length) * 4) {
          indices.push(Math.floor(Math.random() * wordBank.length));
        }

        for (let idx of indices) {
          text.push(wordBank[idx]);
        }
      }

      break;

    case "quote":
      if (!quotesCache) {
        path = Uri.joinPath(extensionUri, "passages", "quotes.json");
        raw = await workspace.fs.readFile(path);
        contents = Buffer.from(raw).toString("utf8");
        quotesCache = JSON.parse(contents);
      }
      if (quotesCache) { // should always be true, here to please the lsp
        const quote = quotesCache[length][
          Math.floor(Math.random() * quotesCache[length].length)
        ];
        text = quote["text"].split(" ");
        by = quote["by"];
        context = quote["context"];
      }

      break;
  }

  return {
    mode: mode,
    length: length,
    text: text,
    by: by,
    context: context,
  };
}
