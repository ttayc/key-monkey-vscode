// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension active');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('code-monkey.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Ran');

		const panel = vscode.window.createWebviewPanel(
			'viewType',
			'title', vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);


		panel.webview.html = CONTENT;

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }


// TODO: Content security policy
const CONTENT = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">

		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>title</title>
	</head>
	<body>
		<textarea id="w3review" name="w3review" rows="4" cols="50">
		</textarea>
	</body>
	</html>
	`
