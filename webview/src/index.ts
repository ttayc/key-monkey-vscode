import { Tooltip } from 'bootstrap';
import "./vscode-webview.d.ts";
import { initializeTest, resetOrRestartTest } from "./typing-test";
import { TypingTestConfig, getTypingTestConfig } from "./menu"

const vscode = acquireVsCodeApi();

// tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const _ = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl))

let currentPassage: string[];

document.getElementById("restart-button")?.addEventListener("click", (_) => {
  resetOrRestartTest();
});

document.getElementById("retry-button")?.addEventListener("click", (_) => {
  resetOrRestartTest();
});

document.getElementById("next-button")?.addEventListener("click", (_) => {
  getNewPassage(getTypingTestConfig());
});


export function getNewPassage(config: TypingTestConfig) {
  vscode.postMessage({
    command: 'passage-request',
    mode: config.mode,
    length: config.length
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

getNewPassage(getTypingTestConfig());

