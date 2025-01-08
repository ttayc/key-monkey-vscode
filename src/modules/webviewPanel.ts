import * as vscode from "vscode";

// export function getWebviewOptions(
//   extensionUri: vscode.Uri
// ): vscode.WebviewOptions {
//   return {
//     enableScripts: true,
//     localResourceRoots: [vscode.Uri.joinPath(extensionUri, "webview")],
//     retainContextWhenHidden: true, // Retains the WebView's state
//   };
// }


export class TypingTestPanel {
  public static currentPanel: TypingTestPanel | undefined;

  public static readonly viewType = "typingTest";
  public static readonly viewTitle = "TITLE";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  // private _disposables: vscode.Disposable[] = [];

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
    //   null
    //   // this._disposables
    // );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null
      // this._disposables
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
    // this._panel.dispose();
    //
    // while (this._disposables.length) {
    //   const x = this._disposables.pop();
    //   if (x) {
    //     x.dispose();
    //   }
    // }
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

        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

        <link rel="stylesheet" href="${stylesUri}">

        <title>Code Monkey</title>

    </head>

    <body>
        <div id="container">
            <div id="test-wrapper">
                <div id="stats">
                    <div id="word-count"></div>
                </div>
                <div id="input-wrapper">
                    <input type="text" id="user-text" onpaste="return false;" ondrop="return false;" spellcheck="false"
                        autocomplete="off" autocorrect="off" autocapitalize="off" />

                    <div id="start-text"></div>
                </div>
            </div>
            <div id="results">
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
