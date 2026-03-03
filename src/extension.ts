import * as vscode from 'vscode';

let storedCode = '';
let unlockModeActive = false;
let currentPointer = 0;

// Feature 1: Strict Mode
let strictModeEnabled = false;

// Feature 2: Explain Mode
let explainModeEnabled = false;

// Feature 3: Typing Stats System
let sessionStats = {
    keystrokes: 0,
    startTime: 0,
    endTime: 0,
    charsUnlocked: 0,
    isActive: false
};

function resetStats() {
    sessionStats = {
        keystrokes: 0,
        startTime: 0,
        endTime: 0,
        charsUnlocked: 0,
        isActive: false
    };
}

function startStats() {
    resetStats();
    sessionStats.startTime = Date.now();
    sessionStats.isActive = true;
}

function stopStats() {
    if (sessionStats.isActive) {
        sessionStats.endTime = Date.now();
        sessionStats.isActive = false;
    }
}

function showStats() {
    const endTime = sessionStats.isActive ? Date.now() : sessionStats.endTime;
    const timeSpentMs = endTime - sessionStats.startTime;
    const timeSpentSec = (timeSpentMs / 1000).toFixed(2);
    const speed = parseFloat(timeSpentSec) > 0 ? (sessionStats.charsUnlocked / parseFloat(timeSpentSec)).toFixed(2) : "0.00";
    
    vscode.window.showInformationMessage(
        `TypeToUnlock Stats: \n` +
        `- Keystrokes: ${sessionStats.keystrokes}\n` +
        `- Time: ${timeSpentSec}s\n` +
        `- Chars Unlocked: ${sessionStats.charsUnlocked}\n` +
        `- Speed: ${speed} chars/sec`
    );
}

function setUnlockMode(active: boolean) {
    unlockModeActive = active;
    vscode.commands.executeCommand('setContext', 'typeToUnlock.active', active);
    
    if (!active) {
        // Automatically deactivate strict mode context when unlock finishes
        vscode.commands.executeCommand('setContext', 'typeToUnlock.strictMode', false);
        stopStats();
    } else {
        vscode.commands.executeCommand('setContext', 'typeToUnlock.strictMode', strictModeEnabled);
        startStats();
    }
}

export function activate(context: vscode.ExtensionContext) {
    // Feature 1: Strict Mode Command overrides
    const originalTypeCommand = vscode.commands.registerCommand('type', (args) => {
        if (unlockModeActive && strictModeEnabled) {
            // Block typing entirely
            return;
        }
        return vscode.commands.executeCommand('default:type', args);
    });

    const blockActionCommand = vscode.commands.registerCommand('type-to-unlock.blockAction', () => {
        // Do nothing, used to block keybindings like backspace, delete, paste
    });

    const toggleStrictModeCommand = vscode.commands.registerCommand('type-to-unlock.toggleStrictMode', () => {
        strictModeEnabled = !strictModeEnabled;
        if (unlockModeActive) {
            vscode.commands.executeCommand('setContext', 'typeToUnlock.strictMode', strictModeEnabled);
        }
        vscode.window.showInformationMessage(`TypeToUnlock Strict Mode: ${strictModeEnabled ? 'ON' : 'OFF'}`);
    });

    // Feature 2: Explain Mode
    const toggleExplainModeCommand = vscode.commands.registerCommand('type-to-unlock.toggleExplainMode', () => {
        explainModeEnabled = !explainModeEnabled;
        vscode.window.showInformationMessage(`TypeToUnlock Explain Mode: ${explainModeEnabled ? 'ON' : 'OFF'}`);
    });

    // Feature 3: Stats Mode
    const showStatsCommand = vscode.commands.registerCommand('type-to-unlock.showStats', () => {
        showStats();
    });

    const startCommand = vscode.commands.registerCommand('type-to-unlock.start', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Paste the generated code here to unlock progressively',
            placeHolder: 'Paste code...'
        });

        if (input !== undefined && input.length > 0) {
            storedCode = input;
            currentPointer = 0;
            setUnlockMode(true);
            vscode.window.showInformationMessage('Unlock mode activated! Press Tab to unlock characters.');
        } else {
            vscode.window.showWarningMessage('No code provided. Unlock mode canceled.');
        }
    });

    const startFromClipboardCommand = vscode.commands.registerCommand('type-to-unlock.startFromClipboard', async () => {
        const text = await vscode.env.clipboard.readText();

        if (text && text.length > 0) {
            storedCode = text;
            currentPointer = 0;
            setUnlockMode(true);
            vscode.window.showInformationMessage('Unlock mode activated! Press Tab to unlock characters.');
        } else {
            vscode.window.showWarningMessage('Clipboard is empty. Unlock mode canceled.');
        }
    });

    const keypressCommand = vscode.commands.registerCommand('type-to-unlock.keypress', async () => {
        if (!unlockModeActive) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        if (currentPointer < storedCode.length) {
            sessionStats.keystrokes++;

            let nextPointer = currentPointer;
            
            if (explainModeEnabled) {
                // Explain mode forces line-by-line unlock
                nextPointer = storedCode.indexOf('\n', currentPointer);
                if (nextPointer === -1) {
                    nextPointer = storedCode.length;
                } else {
                    nextPointer++; // Include newline character
                }

                const explanation = await vscode.window.showInputBox({
                    prompt: 'Explain what this line does (>= 10 chars required)',
                    placeHolder: 'Explanation...'
                });

                if (!explanation || explanation.length < 10) {
                    vscode.window.showWarningMessage('Explanation too short! Must be at least 10 characters.');
                    return; // Abort unlocking this line
                }
            } else {
                // Normal mode unlocks char-by-char
                const config = vscode.workspace.getConfiguration('typeToUnlock');
                const charsToUnlock = Math.max(1, config.get<number>('charsPerKeypress', 1));
                nextPointer = Math.min(storedCode.length, currentPointer + charsToUnlock);
            }

            const chunkToInsert = storedCode.substring(currentPointer, nextPointer);

            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, chunkToInsert);
            }).then(success => {
                if (success) {
                    sessionStats.charsUnlocked += (nextPointer - currentPointer);
                    currentPointer = nextPointer;

                    if (currentPointer >= storedCode.length) {
                        setUnlockMode(false);
                        storedCode = '';
                        vscode.window.showInformationMessage('Code fully unlocked!');
                        showStats();
                    }
                }
            });
        }
    });

    const keypressLineCommand = vscode.commands.registerCommand('type-to-unlock.keypressLine', () => {
        if (!unlockModeActive) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        if (currentPointer < storedCode.length) {
            sessionStats.keystrokes++;
            
            let nextPointer = storedCode.indexOf('\n', currentPointer);
            if (nextPointer === -1) {
                nextPointer = storedCode.length;
            } else {
                nextPointer++; // Include the newline character
            }

            const chunkToInsert = storedCode.substring(currentPointer, nextPointer);

            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, chunkToInsert);
            }).then(success => {
                if (success) {
                    sessionStats.charsUnlocked += (nextPointer - currentPointer);
                    currentPointer = nextPointer;

                    if (currentPointer >= storedCode.length) {
                        setUnlockMode(false);
                        storedCode = '';
                        vscode.window.showInformationMessage('Code fully unlocked!');
                        showStats();
                    }
                }
            });
        }
    });

    context.subscriptions.push(
        startCommand, 
        startFromClipboardCommand, 
        keypressCommand, 
        keypressLineCommand,
        toggleStrictModeCommand,
        toggleExplainModeCommand,
        showStatsCommand,
        blockActionCommand,
        originalTypeCommand
    );
}

export function deactivate() {
    setUnlockMode(false);
    storedCode = '';
    currentPointer = 0;
    stopStats();
}
