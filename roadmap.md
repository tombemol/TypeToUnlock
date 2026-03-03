# TypeToUnlock Roadmap

This document outlines the strategic direction and planned feature set for the TypeToUnlock extension. The roadmap focuses on expanding the insertion modalities and enforcing stricter interaction patterns without compromising the extension's minimal, in-memory architecture.

## MVP (Completed)

- [x] Basic extension scaffolding
- [x] In-memory state management
- [x] Input box support (`TypeToUnlock: Start`)
- [x] Clipboard support (`TypeToUnlock: Start from Clipboard`)
- [x] Character-by-character progressive insertion via keybinding
- [x] Context-aware keybinding activation (`typeToUnlock.active`)

## Next Improvements

The following features represent the immediate tactical priorities for the next iteration of the extension.

- **Line-by-line mode**: Introduce an alternative command that inserts the buffered code one complete line per keystroke, catering to larger code blocks where character-by-character insertion is too tedious.
- **Block mode**: Allow insertion of code in logical blocks (e.g., function signatures, block statements) rather than strict characters or lines.
- **Configurable unlock speed**: Add workspace settings (`contributes.configuration`) to allow users to define multiple characters per keystroke, adjusting the friction to their preference.
- **Strict mode**: Implement a toggleable strict mode that actively suppresses normal typing or document edits until the unlock buffer is cleared or canceled.
- **Typing statistics**: Track and display basic session metrics (e.g., characters unlocked, time spent in active review) via the VS Code Status Bar to quantify the review process.
- **Marketplace release**: Finalize documentation, create extension icon/assets, configure CI/CD via GitHub Actions, and publish the initial version to the Visual Studio Marketplace via `vsce publish`.

## Long-term Vision

The long-term goal for TypeToUnlock is to seamlessly integrate deeply with the native VS Code Copilot and inline-chat ecosystem. Rather than relying solely on the clipboard or explicit command invocation, the extension aims to intercept code suggestions from active AI providers and route them through the progressive unlock engine. 

The ultimate objective is to standardize an "active review" phase in AI-assisted development, ensuring that generated code is consistently comprehended before it becomes part of the permanent codebase.
