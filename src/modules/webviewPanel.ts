import * as vscode from "vscode";
import getPassage from "./passage";

export class TypingTestPanel {
  public static currentPanel: TypingTestPanel | undefined;

  public static readonly viewType = "typingTest";
  public static readonly viewTitle = "TITLE";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (TypingTestPanel.currentPanel) {
      TypingTestPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      TypingTestPanel.viewType,
      TypingTestPanel.viewTitle,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "webview")],
        retainContextWhenHidden: true,
      }
    );

    TypingTestPanel.currentPanel = new TypingTestPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    TypingTestPanel.currentPanel = new TypingTestPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this.update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null);

    // Update the content based on view changes
    // this._panel.onDidChangeViewState(
    //   () => {
    //     if (this._panel.visible) {
    //       this.update();
    //     }
    //   },
    //   null,
    //   this._disposables
    // );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        let passage: string[] = [];
        switch (message.command) {
          case "passage-request":
            passage = await getPassage(
              this._extensionUri,
              message.mode,
              message.length
            );
        }

        this._panel.webview.postMessage({
          command: "passage-response",
          passage: passage,
        });
        return;
      },
      null,
      this._disposables
    );
  }

  // Function to update the webview's html content and title
  private update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this.webViewHtml(webview);
    this._panel.title = TypingTestPanel.viewTitle;
    // this._panel.iconPath = vscode.Uri.joinPath(
    //   this._extensionUri,
    //   "webview",
    //   "icon.svg"
    // );
  }

  public dispose() {
    TypingTestPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private webViewHtml(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview", "index.js")
    );
    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview", "styles.css")
    );

    const nonce = generateNonce();

    return `<!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <meta http-equiv="Content-Security-Policy" content="
          default-src 'none';
          style-src ${webview.cspSource} 
            https://cdn.jsdelivr.net 
            'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH'; 
          font-src https://cdn.jsdelivr.net; 
          script-src 'nonce-${nonce}'
            https://cdn.jsdelivr.net 
            'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
        ">

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <link rel="stylesheet" href="${stylesUri}">

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossorigin="anonymous"></script>

        <title>Code Monkey</title>

    </head>

    <body>
        <div id="wrapper">
            <div id="test-wrapper">
                <div id="stats">
                    <div id="word-count"></div>
                </div>
                <div id="input-wrapper">
                    <input type="text" id="user-text" onpaste="return false;" ondrop="return false;" spellcheck="false"
                        autocomplete="off" autocorrect="off" autocapitalize="off" />

                    <div id="start-text"></div>
                </div>
              <button type="button" id="restart-button" class="btn btn-minimal" data-bs-toggle="tooltip"
                  data-bs-placement="bottom" data-bs-title="restart">
                  <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div id="results" class="container text-center hidden">
                <div class="row">
                    <table>
                        <tr class="primary-result">
                            <td class="value" id="wpm"></td>
                            <td class="unit">wpm</td>
                        </tr>
                        <tr class="primary-result">
                            <td class="value" id="accuracy"></td>
                            <td class="unit">accuracy</td>
                        </tr>
                        <tr class="secondary-result">
                            <td class="value" id="raw-wpm"></td>
                            <td class="unit">raw wpm</td>
                        </tr>
                    </table>
                </div>
                <div class="row">
                    <div class="col">
                        <button type="button" id="next-button" class="btn btn-minimal" data-bs-toggle="tooltip"
                            data-bs-placement="bottom" data-bs-title="next">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                    <div class="col">
                        <button type="button" id="retry-button" class="btn btn-minimal" data-bs-toggle="tooltip"
                            data-bs-placement="bottom" data-bs-title="retry">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                    </div>
                </div>

            </div>

        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>
    `;
  }
}

function generateNonce() {
  const crypto = require("crypto");
  return crypto.randomBytes(16).toString("base64");
}
