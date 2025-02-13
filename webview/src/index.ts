import { Tooltip } from 'bootstrap';
import "./vscode-webview.d.ts";
import { initializeTest, resetOrRestartTest } from "./typing-test";
import { TypingTestConfig, getTypingTestConfig } from "./menu"

const vscode = acquireVsCodeApi();

// tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
// @ts-expect-error
const _ = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl))

let currentPassage: string[];

function startNextTest() {
  getNewPassage(getTypingTestConfig());
}

document.getElementById("restart-button")?.addEventListener("click", (_) => {
  resetOrRestartTest();
});

document.getElementById("retry-button")?.addEventListener("click", (_) => {
  resetOrRestartTest();
});

document.getElementById("next-button")?.addEventListener("click", (_) => {
  startNextTest();
});

document.addEventListener("keydown", (event) => {
  // Key mappings:
  //
  //    - ENTER => equivalent to clicking next-button
  //    - SHIFT-ENTER => equivalent to clicking restart-button OR retry-button
  //
  // For consistency, we check that the respective button is available for the
  // key bind to be considered active. This is to respect the existing UI where
  // certain buttons are only available on certain "pages", which are
  // ever-present in the DOM but take turns being visible. This hopefully makes
  // any updates to such buttons automatically propagate to this listener.

  function isElementAvailable(id: string): boolean {
    const element = document.getElementById(id);
    if (!element) {
      return false;
    }
    // The buttons may not be directly `.hidden` (but rather indirectly e.g.
    // next-button via the results page), so we use `.offsetParent` instead:
    // https://stackoverflow.com/a/21696585/14226122.
    return element.offsetParent !== null;
  }

  const { key, shiftKey } = event;
  if (key === "Enter" && shiftKey && isElementAvailable("restart-button")) {
    console.log("Restarting test via keybind");
    resetOrRestartTest();
  }
  if (key === "Enter" && shiftKey && isElementAvailable("retry-button")) {
    console.log("Retrying test via keybind");
    resetOrRestartTest();
  }
  if (key === "Enter" && !shiftKey && isElementAvailable("next-button")) {
    console.log("Moving on to next test via keybind");
    startNextTest();
  }
  // Other potential key mappings...
});

export function getNewPassage(config: TypingTestConfig) {
  console.log('get new passage');
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

