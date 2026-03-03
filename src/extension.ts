import * as vscode from 'vscode';

let storedCode = '';
let unlockModeActive = false;
let currentPointer = 0;

function setUnlockMode(active: boolean) {
    unlockModeActive = active;
    vscode.commands.executeCommand('setContext', 'typeToUnlock.active', active);
}

export function activate(context: vscode.ExtensionContext) {
    const startCommand = vscode.commands.registerCommand('type-to-unlock.start', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Paste the generated code here to unlock progressively',
            placeHolder: 'Paste code...'
        });

        if (input !== undefined && input.length > 0) {
            storedCode = input;
            currentPointer = 0;
            setUnlockMode(true);
            vscode.window.showInformationMessage('Unlock mode activated! Press Tab (or your configured key) to unlock characters.');
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
            vscode.window.showInformationMessage('Unlock mode activated! Press Tab (or your configured key) to unlock characters.');
        } else {
            vscode.window.showWarningMessage('Clipboard is empty. Unlock mode canceled.');
        }
    });

    const keypressCommand = vscode.commands.registerCommand('type-to-unlock.keypress', () => {
        if (!unlockModeActive) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        if (currentPointer < storedCode.length) {
            const config = vscode.workspace.getConfiguration('typeToUnlock');
            const charsToUnlock = Math.max(1, config.get<number>('charsPerKeypress', 1));

            let nextPointer = currentPointer + charsToUnlock;
            if (nextPointer > storedCode.length) {
                nextPointer = storedCode.length;
            }
            const chunkToInsert = storedCode.substring(currentPointer, nextPointer);

            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, chunkToInsert);
            }).then(success => {
                if (success) {
                    currentPointer = nextPointer;

                    if (currentPointer >= storedCode.length) {
                        setUnlockMode(false);
                        storedCode = '';
                        vscode.window.showInformationMessage('Code fully unlocked!');
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
                    currentPointer = nextPointer;

                    if (currentPointer >= storedCode.length) {
                        setUnlockMode(false);
                        storedCode = '';
                        vscode.window.showInformationMessage('Code fully unlocked!');
                    }
                }
            });
        }
    });

    context.subscriptions.push(startCommand, startFromClipboardCommand, keypressCommand, keypressLineCommand);
}

export function deactivate() {
    setUnlockMode(false);
    storedCode = '';
    currentPointer = 0;
}
