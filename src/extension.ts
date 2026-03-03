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

// Feature 4: Challenge Mode
let challengeModeEnabled = false;
let challengeStats = {
    linesChallenged: 0,
    linesMatched: 0
};

function resetStats() {
    sessionStats = {
        keystrokes: 0,
        startTime: 0,
        endTime: 0,
        charsUnlocked: 0,
        isActive: false
    };
    challengeStats = {
        linesChallenged: 0,
        linesMatched: 0
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
        // Automatically deactivate strict mode and challenge mode context when unlock finishes
        vscode.commands.executeCommand('setContext', 'typeToUnlock.strictMode', false);
        vscode.commands.executeCommand('setContext', 'typeToUnlock.challengeMode', false);
        stopStats();
    } else {
        vscode.commands.executeCommand('setContext', 'typeToUnlock.strictMode', strictModeEnabled);
        vscode.commands.executeCommand('setContext', 'typeToUnlock.challengeMode', challengeModeEnabled);
        startStats();
    }
}

// Challenge Mode Helpers
function normalizeLine(line: string): string[] {
    return line.trim().toLowerCase().split(/\s+/).filter(word => word.length > 0);
}

function calculateSimilarity(prediction: string[], actual: string[]): number {
    if (actual.length === 0) return prediction.length === 0 ? 1 : 0;

    let matchCount = 0;
    const actualCopy = [...actual];

    for (const word of prediction) {
        const index = actualCopy.indexOf(word);
        if (index > -1) {
            matchCount++;
            actualCopy.splice(index, 1);
        }
    }

    return matchCount / actual.length;
}

function finalizeChallenge() {
    if (!challengeModeEnabled || challengeStats.linesChallenged === 0) return;

    const matched = challengeStats.linesMatched;
    const challenged = challengeStats.linesChallenged;
    const accuracy = challenged > 0 ? Math.round((matched / challenged) * 100) : 0;

    let message = "";
    if (accuracy < 40) {
        message = "The AI carried you today.";
    } else if (accuracy < 70) {
        message = "You're thinking. Keep sharpening.";
    } else if (accuracy <= 90) {
        message = "You're dangerous.";
    } else {
        message = "AI might be learning from you.";
    }

    vscode.window.showInformationMessage(
        `Challenge Complete.\n\n` +
        `Lines matched: ${matched} / ${challenged}\n` +
        `Accuracy: ${accuracy}%\n\n` +
        `Message:\n${message}`,
        { modal: true }
    );
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
        if (explainModeEnabled && challengeModeEnabled) {
            challengeModeEnabled = false; // Mutually exclusive
            if (unlockModeActive) {
                vscode.commands.executeCommand('setContext', 'typeToUnlock.challengeMode', false);
            }
            vscode.window.showInformationMessage(`TypeToUnlock Explain Mode: ON (Challenge Mode disabled)`);
        } else {
            vscode.window.showInformationMessage(`TypeToUnlock Explain Mode: ${explainModeEnabled ? 'ON' : 'OFF'}`);
        }
    });

    // Feature 3: Stats Mode
    const showStatsCommand = vscode.commands.registerCommand('type-to-unlock.showStats', () => {
        showStats();
    });

    // Feature 4: Challenge Mode
    const toggleChallengeModeCommand = vscode.commands.registerCommand('type-to-unlock.toggleChallengeMode', () => {
        challengeModeEnabled = !challengeModeEnabled;
        if (challengeModeEnabled && explainModeEnabled) {
            explainModeEnabled = false; // Mutually exclusive
            vscode.window.showInformationMessage(`TypeToUnlock Challenge Mode: ON (Explain Mode disabled)`);
        } else {
            vscode.window.showInformationMessage(`TypeToUnlock Challenge Mode: ${challengeModeEnabled ? 'ON' : 'OFF'}`);
        }

        if (unlockModeActive) {
            vscode.commands.executeCommand('setContext', 'typeToUnlock.challengeMode', challengeModeEnabled);
        }
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
            let currentLineText = "";

            if (explainModeEnabled || challengeModeEnabled) {
                // Explain / Challenge mode forces line-by-line unlock
                nextPointer = storedCode.indexOf('\n', currentPointer);
                if (nextPointer === -1) {
                    nextPointer = storedCode.length;
                    currentLineText = storedCode.substring(currentPointer);
                } else {
                    currentLineText = storedCode.substring(currentPointer, nextPointer);
                    nextPointer++; // Include newline character
                }

                if (challengeModeEnabled) {
                    const prediction = await vscode.window.showInputBox({
                        prompt: 'Predict the next line of code',
                        placeHolder: 'Prediction...'
                    });

                    if (prediction === undefined) {
                        return; // Aborted input
                    }

                    const normalizedPrediction = normalizeLine(prediction);
                    const normalizedActual = normalizeLine(currentLineText);
                    const similarity = calculateSimilarity(normalizedPrediction, normalizedActual);

                    challengeStats.linesChallenged++;
                    if (similarity >= 0.5) {
                        challengeStats.linesMatched++;
                    }

                } else if (explainModeEnabled) {
                    const explanation = await vscode.window.showInputBox({
                        prompt: 'Explain what this line does (>= 10 chars required)',
                        placeHolder: 'Explanation...'
                    });

                    if (!explanation || explanation.length < 10) {
                        vscode.window.showWarningMessage('Explanation too short! Must be at least 10 characters.');
                        return; // Abort unlocking this line
                    }
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
                        finalizeChallenge();
                    }
                }
            });
        }
    });

    const keypressLineCommand = vscode.commands.registerCommand('type-to-unlock.keypressLine', async () => {
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
            let currentLineText = "";
            if (nextPointer === -1) {
                nextPointer = storedCode.length;
                currentLineText = storedCode.substring(currentPointer);
            } else {
                currentLineText = storedCode.substring(currentPointer, nextPointer);
                nextPointer++; // Include the newline character
            }

            if (challengeModeEnabled) {
                const prediction = await vscode.window.showInputBox({
                    prompt: 'Predict the next line of code',
                    placeHolder: 'Prediction...'
                });

                if (prediction === undefined) {
                    return; // Aborted input
                }

                const normalizedPrediction = normalizeLine(prediction);
                const normalizedActual = normalizeLine(currentLineText);
                const similarity = calculateSimilarity(normalizedPrediction, normalizedActual);

                challengeStats.linesChallenged++;
                if (similarity >= 0.5) {
                    challengeStats.linesMatched++;
                }

            } else if (explainModeEnabled) {
                const explanation = await vscode.window.showInputBox({
                    prompt: 'Explain what this line does (>= 10 chars required)',
                    placeHolder: 'Explanation...'
                });

                if (!explanation || explanation.length < 10) {
                    vscode.window.showWarningMessage('Explanation too short! Must be at least 10 characters.');
                    return; // Abort unlocking this line
                }
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
                        finalizeChallenge();
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
        toggleChallengeModeCommand,
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
