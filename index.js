'use strict';

import colors from 'yoctocolors';
import cliCursor from 'cli-cursor';
import spinners from './spinners.json' with { type: 'json' };
import {
    purgeSpinnerOptions,
    purgeSpinnersOptions,
    colorOptions,
    breakText,
    getLinesLength,
    moveCursorSequence,
    writeStream,
    cleanStream,
    CLEAR_SCREEN_DOWN,
    DEFAULT_COLOR,
} from './utils.js';

const { dashes, dots } = spinners;

const FINISHED_STATUSES = ['fail', 'succeed', 'non-spinnable'];
const STOPPABLE_STATUSES = ['fail', 'succeed'];

/**
 * Every live instance shares a single `exit` listener. Binding one per instance used to
 * cross Node's default cap of 10 listeners per event as soon as 10 instances existed.
 *
 * Signals are deliberately left alone: `cliCursor.hide()` registers its own restore hook,
 * and a library that traps SIGINT to call `process.exit()` robs the host application of
 * its own shutdown sequence.
 */
const liveInstances = new Set();
let exitListener = null;

function bindExitListener() {
    if (exitListener) return;

    exitListener = () => {
        for (const instance of liveInstances) instance.cleanup();
    };

    try {
        process.on('exit', exitListener);
    } catch { // some hosts freeze the process object
        exitListener = null;
    }
}

function unbindExitListener() {
    if (!exitListener || liveInstances.size > 0) return;

    try {
        process.removeListener('exit', exitListener);
    } catch { /* idem */ }

    exitListener = null;
}

class Spinnies {
    constructor(options = {}) {
        // `purgeSpinnersOptions` always returns every color, both prefixes and a validated
        // spinner, so listing defaults here would be dead code.
        this.options = {
            disableSpins: false,
            ...purgeSpinnersOptions(options),
        };

        this.spinners = {};
        this.rawRenderedLines = new Map();
        this.isCursorHidden = false;
        this.currentInterval = null;
        this.stream = process.stderr;
        this.lineCount = 0;
        this.currentFrameIndex = 0;
        this.isDestroyed = false;

        this.spin = Boolean(
            !this.options.disableSpins
            && !process.env.CI
            && this.stream?.isTTY
            && this.stream?.writable
        );

        // Disabling spins is a deliberate choice, not a fallback worth warning about.
        if (!this.spin && !this.options.disableSpins) {
            console.warn('[spinnies] Falling back to raw output (TTY not detected)');
        }

        liveInstances.add(this);
        bindExitListener();
    }

    cleanup() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }

        if (this.isCursorHidden && this.stream?.writable) {
            cliCursor.show();
            this.isCursorHidden = false;
        }

        if (this.lineCount > 0 && this.stream?.writable) {
            this.stream.write(`${moveCursorSequence(0, this.lineCount)}${CLEAR_SCREEN_DOWN}`);
            this.lineCount = 0;
        }
    }

    destroy() {
        if (this.isDestroyed) return;

        // Cleanup runs first: it used to be called after `isDestroyed` was set, and bailed
        // out on that very flag, leaving the interval running and the cursor hidden.
        this.cleanup();

        this.isDestroyed = true;
        liveInstances.delete(this);
        unbindExitListener();

        this.spinners = {};
        this.rawRenderedLines.clear();
        this.options = null;
        this.stream = null;
    }

    pick(name) {
        if (typeof name !== 'string') return undefined;

        return this.spinners[name];
    }

    add(name, options = {}) {
        if (this.isDestroyed) throw new Error('Spinnies instance has been destroyed');

        if (typeof name !== 'string' || !name.trim()) throw new Error('A spinner reference name must be specified');
        if (this.spinners[name]) throw new Error(`Spinner with name "${name}" already exists.`);

        // Purged into a fresh object so the caller's options are never mutated.
        const purgedOptions = purgeSpinnerOptions(options);
        if (!purgedOptions.text) purgedOptions.text = name;

        const spinnerProperties = {
            ...colorOptions(this.options),
            succeedPrefix: this.options.succeedPrefix,
            failPrefix: this.options.failPrefix,
            status: 'spinning',
            ...purgedOptions,
        };

        this.spinners[name] = spinnerProperties;
        this.updateSpinnerState();

        return spinnerProperties;
    }

    update(name, options = {}) {
        if (this.isDestroyed) throw new Error('Spinnies instance has been destroyed');

        // The status goes through `setSpinnerProperties` unvalidated when passed as an
        // argument, so it is left to be picked from the purged options instead.
        const spinner = this.setSpinnerProperties(name, options);
        this.updateSpinnerState();

        return spinner;
    }

    succeed(name, options = {}) {
        if (this.isDestroyed) throw new Error('Spinnies instance has been destroyed');

        const spinner = this.setSpinnerProperties(name, options, 'succeed');
        this.updateSpinnerState();

        return spinner;
    }

    fail(name, options = {}) {
        if (this.isDestroyed) throw new Error('Spinnies instance has been destroyed');

        const spinner = this.setSpinnerProperties(name, options, 'fail');
        this.updateSpinnerState();

        return spinner;
    }

    remove(name) {
        if (this.isDestroyed) throw new Error('Spinnies instance has been destroyed');

        if (typeof name !== 'string') throw new Error('A spinner reference name must be specified');
        if (!this.spinners[name]) throw new Error(`No spinner initialized with name ${name}`);

        delete this.spinners[name];
        this.rawRenderedLines.delete(name);
        this.updateSpinnerState();
    }

    stopAll(newStatus = 'stopped') {
        if (this.isDestroyed) throw new Error('Spinnies instance has been destroyed');

        // Captured before rendering: a completed run swaps `this.spinners` for a fresh
        // object, which used to make this method always return `{}`.
        const stoppedSpinners = this.spinners;

        for (const spinner of Object.values(stoppedSpinners)) {
            if (FINISHED_STATUSES.includes(spinner.status)) continue;

            if (STOPPABLE_STATUSES.includes(newStatus)) {
                spinner.status = newStatus;
                spinner.color = this.options[`${newStatus}Color`];
            } else {
                spinner.status = 'stopped';
                spinner.color = DEFAULT_COLOR.STOPPED;
            }
        }

        // Routed through the normal render path: calling `checkIfActiveSpinners` directly
        // skipped raw output, so the final statuses were never logged outside a TTY.
        this.updateSpinnerState();

        return stoppedSpinners;
    }

    hasActiveSpinners() {
        // Hot path, called on every frame: avoids the array `Object.values` would allocate.
        for (const name in this.spinners) {
            if (this.spinners[name].status === 'spinning') return true;
        }

        return false;
    }

    setSpinnerProperties(name, options, status) {
        if (typeof name !== 'string') throw new Error('A spinner reference name must be specified');

        const spinner = this.spinners[name];
        if (!spinner) throw new Error(`No spinner initialized with name ${name}`);

        // Mutated in place so references handed out by `add`/`pick` stay live, matching
        // what `stopAll` already did. Replacing the object also reset every color that
        // the caller had not restated.
        const purgedOptions = purgeSpinnerOptions(options);
        Object.assign(spinner, purgedOptions);
        spinner.status = status ?? purgedOptions.status ?? spinner.status ?? 'spinning';

        return spinner;
    }

    updateSpinnerState() {
        if (this.isDestroyed) return;

        if (this.spin) {
            if (this.hasActiveSpinners()) {
                // Reused rather than torn down and rebuilt: recreating it on every mutation
                // allocated a timer per call and restarted the frame cadence each time.
                this.currentInterval ??= this.loopStream();

                if (!this.isCursorHidden) {
                    this.isCursorHidden = true;
                    cliCursor.hide();
                }
            }
        } else {
            this.setRawStreamOutput();
        }

        this.checkIfActiveSpinners();
    }

    loopStream() {
        const { frames, interval } = this.options.spinner;

        return setInterval(() => {
            if (this.isDestroyed) return;

            const success = this.setStreamOutput(frames[this.currentFrameIndex]);
            if (!success) {
                this.cleanup();
                return;
            }
            this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
        }, Math.max(interval, 50)); // Minimum 50ms interval
    }

    setStreamOutput(frame = '') {
        if (this.isDestroyed || !this.stream?.writable) return false;

        let output = '';
        const linesLength = [];
        const hasActiveSpinners = this.hasActiveSpinners();

        for (const spinner of Object.values(this.spinners)) {
            const { text, status, color, spinnerColor, succeedColor, failColor,
                succeedPrefix, failPrefix, indent } = spinner;

            let line;
            let formattedText;
            let prefixLength = indent || 0;

            switch (status) {
            case 'spinning': {
                prefixLength += frame.length + 1;
                formattedText = breakText(text, prefixLength);
                line = `${colors[spinnerColor](frame)} ${
                    color ? colors[color](formattedText) : formattedText
                }`;
                break;
            }
            case 'succeed': {
                prefixLength += succeedPrefix.length + 1;
                formattedText = hasActiveSpinners ? breakText(text, prefixLength) : text;
                line = `${colors[succeedColor](succeedPrefix)} ${colors[succeedColor](formattedText)}`;
                break;
            }
            case 'fail': {
                prefixLength += failPrefix.length + 1;
                formattedText = hasActiveSpinners ? breakText(text, prefixLength) : text;
                line = `${colors[failColor](failPrefix)} ${colors[failColor](formattedText)}`;
                break;
            }
            default: {
                formattedText = hasActiveSpinners ? breakText(text, prefixLength) : text;
                line = color && colors[color] ? colors[color](formattedText) : formattedText;
                break;
            }
            }

            // Measured on the wrapped text, not the raw one: a wrapped line renders as
            // several physical lines, and under-counting them rewound the cursor too
            // little on the next frame, corrupting the display.
            linesLength.push(...getLinesLength(formattedText, prefixLength));
            output += indent ? `${' '.repeat(indent)}${line}\n` : `${line}\n`;
        }

        const prefix = hasActiveSpinners ? '' : CLEAR_SCREEN_DOWN;
        if (!writeStream(this.stream, `${prefix}${output}`, linesLength)) return false;

        if (hasActiveSpinners) cleanStream(this.stream, linesLength);

        this.lineCount = linesLength.length;
        return true;
    }

    setRawStreamOutput() {
        if (this.isDestroyed || !this.stream?.writable) return;

        let output = '';

        for (const [name, spinner] of Object.entries(this.spinners)) {
            const { text, status, succeedPrefix, failPrefix, indent } = spinner;

            let prefix = '-';
            if (status === 'succeed') prefix = succeedPrefix;
            else if (status === 'fail') prefix = failPrefix;

            const line = `${' '.repeat(indent || 0)}${prefix} ${text}`;

            // Raw output is an append-only log, not a canvas: a line is emitted only when
            // it differs from the last one written for that spinner. Reprinting the whole
            // list on every mutation made CI logs grow quadratically.
            if (this.rawRenderedLines.get(name) === line) continue;

            this.rawRenderedLines.set(name, line);
            output += `${line}\n`;
        }

        if (output) this.stream.write(output);
    }

    checkIfActiveSpinners() {
        if (this.isDestroyed || this.hasActiveSpinners()) return;

        if (this.spin) {
            this.setStreamOutput();

            if (this.lineCount > 0 && this.stream?.writable) {
                this.stream.write(moveCursorSequence(0, this.lineCount));
            }
            // Those lines are committed: `cleanup` must not scroll past them a second time.
            this.lineCount = 0;

            if (this.currentInterval) {
                clearInterval(this.currentInterval);
                this.currentInterval = null;
            }

            if (this.isCursorHidden) {
                cliCursor.show();
                this.isCursorHidden = false;
            }
        }

        // Reset in both modes: the registry used to survive in raw mode only, so `pick`
        // returned a spinner or `undefined` depending on whether stderr was a TTY.
        this.spinners = {};
        this.rawRenderedLines.clear();
    }
}

export default Spinnies;
export { dots, dashes };
