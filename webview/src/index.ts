import 'bootstrap';
import "./vscode-webview.d.ts";
import { initializeTest, resetOrRestartTest } from "./typing-test";
import './buttons';

const vscode = acquireVsCodeApi();

// tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const _ = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

let currentPassage: string[];

document.getElementById("restart-button")?.addEventListener("click", (_) => {
  resetOrRestartTest();
});

document.getElementById("retry-button")?.addEventListener("click", (_) => {
  resetOrRestartTest();
});

document.getElementById("next-button")?.addEventListener("click", (_) => {
  getNewPassage('common-200', 10);
});


const getNewPassage = function(mode: string, length: number) {
  vscode.postMessage({
    command: 'passage-request',
    mode: mode,
    length: length
  });
}

window.addEventListener('message', event => {
  const message = event.data;
  switch (message.command) {
    case 'passage-response':
      currentPassage = message.passage;
      initializeTest(message.passage);
      break;
  }
});

getNewPassage('common-200', 10);

