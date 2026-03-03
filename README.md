# TypeToUnlock

A pragmatic VS Code extension that transforms AI-generated code into an active typing experience.

## The Problem

The advent of AI coding assistants has introduced a subtle friction into the developer workflow: the passive consumption of generated code. Copying and pasting large blocks of code can lead to a surface-level understanding of the implemented logic, reducing code comprehension and making debugging more difficult down the line.

TypeToUnlock solves this by forcing the developer to physically interact with the provided code. Instead of instantly pasting a block, the extension buffers the code and inserts it progressively through manual keystrokes, enforcing a moment of review and active reading for every character or line.

## Features

- **Progressive Insertion**: Unlock buffered code character by character or line by line.
- **Multiple Input Vectors**: Accept code via a prompt (`showInputBox`) or directly from the system clipboard.
- **Strict Mode**: Block normal typing, pasting, backspace, and navigation while unlocking to enforce a strict transcription process.
- **Explain Mode**: Force line-by-line unlocking, requiring the developer to type a short explanation (>= 10 characters) before each line is revealed.
- **Challenge Mode**: A competitive mode where developers must predict the next line of code before it is unlocked. A similarity score measures their prediction against the actual AI output.
- **Typing Stats System**: Tracks keystrokes, time elapsed, characters unlocked, and speed per session to give the developer immediate feedback.
- **Context-Aware Activation**: Keystroke interception only activates when an unlock session is in progress.
- **Minimal Footprint**: Operates entirely in-memory with zero disk persistence and no background document change listeners.

## Installation (Development Mode)

Currently, the extension is in MVP status and runs via the VS Code Extension Development Host.

1. Clone or download the repository to your local machine.
2. Open the project folder in VS Code.
3. Install dependencies by running `npm install` in your terminal.
4. Press `F5` to open a new Extension Development Host window with the extension loaded.

## Usage

The extension introduces several commands accessible via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- `TypeToUnlock: Start`: Prompts for code input via a text box.
- `TypeToUnlock: Start from Clipboard`: Directly buffers the current content of your system clipboard.
- `TypeToUnlock: Toggle Strict Mode`: Enables/disables blocking of normal editor actions during an unlock session.
- `TypeToUnlock: Toggle Explain Mode`: Prompts you to explain each line before it unlocks.
- `TypeToUnlock: Toggle Challenge Mode`: Prompts you to predict the next line of code before it unlocks (mutually exclusive with Explain Mode).
- `TypeToUnlock: Show Stats`: View the active or most recent session's keystrokes, elapsed time, and speed.

Once an unlock session is initiated, the `Tab` and `Shift+Tab` keys are temporarily bound:
- `Tab`: Unlocks characters (or prompts for explanation/prediction depending on active modes).
- `Shift+Tab`: Unlocks an entire line at once (or prompts for explanation/prediction).

## Example Workflow

1. Generate a function using your preferred AI tool (e.g., ChatGPT, Claude, GitHub Copilot Chat).
2. Copy the generated code to your clipboard.
3. Enable your preferred training modes (e.g., `TypeToUnlock: Toggle Challenge Mode`).
4. In VS Code, run the command `TypeToUnlock: Start from Clipboard`.
5. Focus your active text editor at the desired insertion point.
6. Press the `Tab` or `Shift+Tab` key repeatedly. Respond to the predict prompts, trying to match the AI logic.
7. Observe and comprehend the logic as it unfolds. The session automatically terminates when the buffer is empty.
8. View your final stats and challenge accuracy.

## Philosophy

TypeToUnlock is built on the premise of active learning. While AI allows us to write code faster, speed should not come at the expense of comprehension. By throttling the insertion of code to the speed of manual keystrokes, developers are given the space to actively parse the structural and logical decisions made by the AI. This bridges the gap between passive copy-pasting and manual transcription.

## Roadmap Summary

The core active-typing paradigms (char-by-char, Explain mode, Challenge mode) are implemented. Future updates will focus on configuring unlock speeds, expanding the challenge mode logic, and adding deeper configuration settings. For detailed planning, please refer to the `roadmap.md` file.

## Contributing

As the project is currently in early MVP stages, direct pull requests are managed internally. However, issue reports regarding extension host stability, context key conflicts, and general feedback on the typing experience are actively reviewed. 

## License

This project is licensed under the MIT License.
