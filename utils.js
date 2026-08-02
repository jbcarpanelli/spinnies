'use strict';

import stripAnsi from 'strip-ansi';
import stringWidth from 'string-width';
import spinners from './spinners.json' with { type: 'json' };

const { dashes, dots } = spinners;

const VALID_STATUSES = new Set([
    'succeed', 'fail', 'spinning', 'non-spinnable', 'stopped',
]);

const VALID_COLORS = new Set([
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
    'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright',
    'magentaBright', 'cyanBright', 'whiteBright',
]);

const COLOR_KEYS = ['color', 'succeedColor', 'failColor', 'spinnerColor'];

const DEFAULT_COLOR = {
    COLOR: 'white',
    SPINNER: 'greenBright',
    SUCCEED: 'green',
    FAILED: 'red',
    STOPPED: 'gray',
};

const CSI = `${String.fromCharCode(27)}[`;
const CLEAR_LINE_RIGHT = `${CSI}0K`;
const CLEAR_SCREEN_DOWN = `${CSI}0J`;

const MAX_INDENT = 100;
const MAX_RECURSIVE = 15;
const TERMINAL_SUPPORTS_UNICODE =
    process.platform !== 'win32' ||
    process.env.TERM_PROGRAM === 'vscode' ||
    Boolean(process.env.WT_SESSION) ||
    Boolean(process.env.TERM_PROGRAM) ||
    process.env.TERM === 'xterm-256color';

function colorOptions({ color, succeedColor, failColor, spinnerColor }) {
    return {
        color: VALID_COLORS.has(color) ? color : DEFAULT_COLOR.COLOR,
        succeedColor: VALID_COLORS.has(succeedColor) ? succeedColor : DEFAULT_COLOR.SUCCEED,
        failColor: VALID_COLORS.has(failColor) ? failColor : DEFAULT_COLOR.FAILED,
        spinnerColor: VALID_COLORS.has(spinnerColor) ? spinnerColor : DEFAULT_COLOR.SPINNER,
    };
}

function purgeSpinnerOptions(options = {}) {
    const { text, status, indent } = options;

    const opts = {};
    for (const key of COLOR_KEYS) {
        if (VALID_COLORS.has(options[key])) opts[key] = options[key];
    }
    if (typeof status === 'string' && VALID_STATUSES.has(status)) opts.status = status;
    if (typeof text === 'string') opts.text = text;
    if (typeof indent === 'number' && indent >= 0 && indent <= MAX_INDENT) opts.indent = indent;

    return opts;
}

function prefixOptions({ succeedPrefix, failPrefix }) {
    return {
        succeedPrefix: succeedPrefix ?? (TERMINAL_SUPPORTS_UNICODE ? '✓' : '√'),
        failPrefix: failPrefix ?? (TERMINAL_SUPPORTS_UNICODE ? '✖' : '×'),
    };
}

function validateSpinner(spinner = {}) {
    const fallback = TERMINAL_SUPPORTS_UNICODE ? dots : dashes;
    if (typeof spinner !== 'object' || spinner == null) return fallback;

    const frames = Array.isArray(spinner.frames) && spinner.frames.length > 0
        ? spinner.frames
        : fallback.frames;

    const interval = typeof spinner.interval === 'number'
        ? spinner.interval
        : fallback.interval;

    return { interval, frames };
}

function purgeSpinnersOptions({ spinner, disableSpins, ...others }) {
    const colors = colorOptions(others);
    const prefixes = prefixOptions(others);
    const disableSpinsOption = typeof disableSpins === 'boolean' ? { disableSpins } : {};
    const validatedSpinner = validateSpinner(spinner);

    return {
        ...colors,
        ...prefixes,
        ...disableSpinsOption,
        spinner: validatedSpinner
    };
}

// recursive function
function breakLine(line, prefixLength, depth = 0) {
    const columns = process.stderr?.columns || 95;
    const limit = Math.max(2, columns - Math.max(0, prefixLength) - 1);

    // Prevents infinite recursion with depth as a counter
    if (stringWidth(line) <= limit || depth > MAX_RECURSIVE) return line;

    // Find a safe breaking point without splitting wide characters
    let width = 0;
    let index = 0;
    while (index < line.length && width + stringWidth(line[index]) <= limit) {
        width += stringWidth(line[index]);
        index++;
    }

    const part = line.slice(0, index);
    const rest = line.slice(index).replace(/^\s+/, '');
    if (!rest) return part;

    return `${part}\n${breakLine(rest, 0, depth + 1)}`;
}

function breakText(text, prefixLength) {
    if (typeof text !== 'string') return '';
    if (typeof prefixLength !== 'number') return '';

    return text
        .split('\n')
        .map((line, index) => breakLine(line, index === 0 ? prefixLength : 0))
        .join('\n');
}

function getLinesLength(text, prefixLength) {
    return stripAnsi(text)
        .split('\n')
        .map((line, index) =>
            index === 0 ? stringWidth(line) + prefixLength : stringWidth(line)
        );
}

function moveCursorSequence(dx, dy) {
    let sequence = '';

    if (dx < 0) sequence += `${CSI}${-dx}D`;
    else if (dx > 0) sequence += `${CSI}${dx}C`;

    if (dy < 0) sequence += `${CSI}${-dy}A`;
    else if (dy > 0) sequence += `${CSI}${dy}B`;

    return sequence;
}

function writeStream(stream, output, rawLines) {
    if (!stream || stream.destroyed) return false;

    try {
        stream.write(`${output}${moveCursorSequence(0, -rawLines.length)}`);
        return true;
    } catch {
        return false;
    }
}

function cleanStream(stream, rawLines) {
    if (!stream || stream.destroyed) return false;

    let sequence = '';
    rawLines.forEach((lineLength, index) => {
        sequence += `${moveCursorSequence(lineLength, index)}${CLEAR_LINE_RIGHT}${moveCursorSequence(-lineLength, -index)}`;
    });
    sequence += `${moveCursorSequence(0, rawLines.length)}${CLEAR_SCREEN_DOWN}${moveCursorSequence(0, -rawLines.length)}`;

    try {
        stream.write(sequence);
        return true;
    } catch {
        return false;
    }
}

export {
    purgeSpinnersOptions,
    purgeSpinnerOptions,
    colorOptions,
    breakText,
    getLinesLength,
    moveCursorSequence,
    writeStream,
    cleanStream,
    CLEAR_SCREEN_DOWN,
    DEFAULT_COLOR,
    TERMINAL_SUPPORTS_UNICODE,
};
