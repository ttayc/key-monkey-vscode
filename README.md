# Key Monkey

A typing test inside your editor!

![demo](key_monkey_demo.gif)

## Getting Started

1. download extension from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=ttayc.key-monkey)
2. `Ctrl + Shift + P` to open the command palette
3. type `Key Monkey: Start` and hit enter

## Features

- **Word mode**: type a series of words from the most common 1000 english words
- **Quote mode**: type a random quote
- **Timer mode**: type until the timer expires

### Future Enhancements

- code snippets mode
- persist configuration across instances
- timeout if user takes too long

## Contributions

Pull requests and issues are welcome! Feedback is appreciated!

### Development Setup

When running for the first time, the extension needs the emitted `webview/index.js` file to exist, so compile it first:

```sh
npm run compile:webview
```

When making changes to the [webview/](webview/), make sure to recompile before rerunning the extension too:

```sh
npm run compile:webview
```

Then as usual, open [src/extension.ts](src/extension.ts) and run the command **Debug: Start Debugging** (<kbd>F5</kbd>) to launch the extension locally in the **Extension Development Host**.
