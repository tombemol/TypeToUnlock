# TypeToUnlock

A pragmatic VS Code extension that transforms AI-generated code into an active typing experience.

## The Problem

The advent of AI coding assistants has introduced a subtle friction into the developer workflow: the passive consumption of generated code. Copying and pasting large blocks of code can lead to a surface-level understanding of the implemented logic, reducing code comprehension and making debugging more difficult down the line.

TypeToUnlock solves this by forcing the developer to physically interact with the provided code. Instead of instantly pasting a block, the extension buffers the code and inserts it progressively through manual keystrokes, enforcing a moment of review and active reading for every character.

## Features

- **Progressive Insertion**: Unlock buffered code character by character.
- **Multiple Input Vectors**: Accept code via a prompt (`showInputBox`) or directly from the system clipboard.
- **Context-Aware Activation**: Keystroke interception only activates when an unlock session is in progress.
- **Minimal Footprint**: Operates entirely in-memory with zero disk persistence and no background document change listeners.

## Installation (Development Mode)

Currently, the extension is in MVP status and runs via the VS Code Extension Development Host.

1. Clone or download the repository to your local machine.
2. Open the project folder in VS Code.
3. Install dependencies by running `npm install` in your terminal.
4. Press `F5` to open a new Extension Development Host window with the extension loaded.

## Usage

The extension introduces two main commands accessible via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- `TypeToUnlock: Start`: Prompts for code input via a text box.
- `TypeToUnlock: Start from Clipboard`: Directly buffers the current content of your system clipboard.

Once an unlock session is initiated, the `Tab` key is temporarily bound to the `type-to-unlock.keypress` command while the editor has focus.

## Example Workflow

1. Generate a function using your preferred AI tool (e.g., ChatGPT, Claude, GitHub Copilot Chat).
2. Copy the generated code to your clipboard.
3. In VS Code, run the command `TypeToUnlock: Start from Clipboard`.
4. Focus your active text editor at the desired insertion point.
5. Press the `Tab` key repeatedly. Each keystroke inserts the next character of the buffered code.
6. Observe and comprehend the logic as it unfolds. The session automatically terminates when the buffer is empty.

## Philosophy

TypeToUnlock is built on the premise of active learning. While AI allows us to write code faster, speed should not come at the expense of comprehension. By throttling the insertion of code to the speed of manual keystrokes, developers are given the space to actively parse the structural and logical decisions made by the AI. This bridges the gap between passive copy-pasting and manual transcription.

## Roadmap Summary

The current MVP demonstrates the core thesis. Future updates will focus on granular insertion controls (line-by-line or block modes), configurable unlock speeds, and stricter typing constraints to further enforce the active learning paradigm. For detailed planning, please refer to the `roadmap.md` file.

## Contributing

As the project is currently in early MVP stages, direct pull requests are managed internally. However, issue reports regarding extension host stability, context key conflicts, and general feedback on the typing experience are actively reviewed. 

## License

This project is licensed under the MIT License.
