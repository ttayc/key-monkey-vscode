import $ from "jquery";
import { Mode, Length } from "@shared/types";
import { getNewPassage } from "./index";


let currentMode: Mode = "words";
let currentLength: Record<Mode, Partial<Length>> = {
  words: "10",
  quote: "short",
  time: "15",
};

export type TypingTestConfig = {
  mode: Mode;
  length: Length;
};

export function getTypingTestConfig(): TypingTestConfig {
  return {
    mode: currentMode,
    length: currentLength[currentMode],
  };
}

const modeOptions: Record<Mode, JQuery<HTMLElement>> = {
  words: $("#mode-menu .nav-item .mode-words"),
  quote: $("#mode-menu .nav-item .mode-quote"),
  time: $("#mode-menu .nav-item .mode-time"),
};

const setModeActive = function(mode: Mode) {
  if (currentMode === mode) {
    return;
  }
  currentMode = mode;
  getNewPassage(getTypingTestConfig());

  for (const [_mode, elem] of Object.entries(modeOptions)) {
    if (mode === _mode) {
      elem.addClass("active");
    } else {
      elem.removeClass("active");
    }
  }
  showLengthOptions(mode);
};

(function addEventListenersToModes() {
  for (const [mode, elem] of Object.entries(modeOptions)) {
    elem.on("click", (_) => {
      setModeActive(mode as Mode);
    });
  }
})();

type ModesToLengths = Record<
  string,
  Partial<Record<Length, JQuery<HTMLElement>>>
>;
const modesToLengths: ModesToLengths = {
  words: {
    "10": $("#length-menu .nav-item .length-10"),
    "25": $("#length-menu .nav-item .length-25"),
    "50": $("#length-menu .nav-item .length-50"),
    "100": $("#length-menu .nav-item .length-100"),
  },
  quote: {
    short: $("#length-menu .nav-item .length-short"),
    medium: $("#length-menu .nav-item .length-medium"),
    long: $("#length-menu .nav-item .length-long"),
  },
  time: {
    "15": $("#length-menu .nav-item .length-15s"),
    "30": $("#length-menu .nav-item .length-30s"),
    "60": $("#length-menu .nav-item .length-60s"),
    "120": $("#length-menu .nav-item .length-120s"),
  },
};

const setLengthActive = function(mode: Mode, length: Length) {
  currentMode = mode;
  currentLength[mode] = length;
  getNewPassage(getTypingTestConfig());

  for (const [len, elem] of Object.entries(modesToLengths[mode])) {
    if (length === len) {
      elem.addClass("active");
    } else {
      elem.removeClass("active");
    }
  }
};

(function addEventListenersToLengths() {
  for (const [mode, val] of Object.entries(modesToLengths)) {
    for (const [len, elem] of Object.entries(val)) {
      elem.on("click", (_) => {
        setLengthActive(mode as Mode, len as Length);
      });
    }
  }
})();

const showLengthOptions = function(mode: Mode) {
  for (const [_mode, val] of Object.entries(modesToLengths)) {
    for (const elem of Object.values(val)) {
      if (mode !== _mode) {
        elem.addClass("hidden");
      } else {
        elem.removeClass("hidden");
      }
    }
  }
};
