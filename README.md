# Description

This is a simple turing machine program coded with `Node.js`, which is controlled with cli.

Node is single threaded, but thanks to the event loop and careful coding without blocking the even loop, we are able to achieve `multi-thread` effect.

# Dependencies

`"blessed": "^0.1.81"` https://www.npmjs.com/package/blessed

`"commander": "^3.0.1"` https://www.npmjs.com/package/commander

**NOTE**:
Commander module has been modified in order for the program not to exit the process on invalid commands, but rather to throw an exception.

# Input file

`index.js`

# Quick explanation

There are three essential files named `index.js` of this project located in

`Cli`

`Turing`

`Main`


Each file exports a class object.

`Cli` class is mainly used to create a **fancy** looking cli using `Blessed` module.

`Turing` class is the core of the project. Turing methods handle cli output based on current turing machine process.

`Main` class reads commands with the help of `Commander` module and based on those commands loads new files or calls Turing class methods.

# Package

There are 3 files `turing-linux`, `turing-macos`, `turing-win.exe` compiled accordingly for linux, mac and windows os.

# Bugs

Scrolling does not work on windows.
