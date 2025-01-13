import { Uri, workspace } from "vscode";

export default async function getPassage(extensionUri: Uri, mode: string, length: number): Promise<string[]> {
  const path = Uri.joinPath(extensionUri, 'src', 'data.json');
  const raw = await workspace.fs.readFile(path)
  const contents = Buffer.from(raw).toString('utf8');
  const contentsJson = JSON.parse(contents);

  const wordBank: string[] = contentsJson[mode];

  const indices: Set<number> = new Set();
  while (indices.size < length) {
    indices.add(Math.floor(Math.random() * wordBank.length));
  }

  const output: string[] = [];
  for (let idx of indices) {
    output.push(wordBank[idx]);
  }

  return output;
}

