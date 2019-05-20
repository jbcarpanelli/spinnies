'use strict';

const readline = require('readline');

const VALID_STATUSES = ['success', 'fail', 'spinning', 'non-spinnable', 'stopped'];
const VALID_COLORS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];

function purgeSpinnerOptions(options) {
  const { text, status } = options;
  const opts = { text, status };
  const colors = colorOptions(options);

  if (!VALID_STATUSES.includes(status)) delete opts.status;
  if (typeof text !== 'string') delete opts.text;

  return { ...colors, ...opts };
}

function purgeSpinnersOptions(options) {
  const { spinner } = options;
  const colors = colorOptions(options)

  return isValidSpinner(spinner) ? { ...colors, spinner } : colors;
}

function isValidSpinner(spinner = {}) {
  const { interval, frames } = spinner;
  return typeof spinner === 'object' && Array.isArray(frames) && frames.length > 0 && typeof interval === 'number';
}

function colorOptions({ color, successColor, failColor, spinnerColor }) {
  const colors = { color, successColor, failColor, spinnerColor };
  Object.keys(colors).forEach(key => {
    if (!VALID_COLORS.includes(colors[key])) delete colors[key];
  });

  return colors;
}

function breakText(text) {
  const columns = process.stderr.columns || 95;
  return text.length >= columns - 3
    ? `${text.substring(0, columns - 3)}\n${breakText(text.substring(columns - 3, text.length))}`
    : text;
}

function preventBreakLines() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.on('keypress', (string, key) => {
    if(key.sequence === '\n' || key.sequence === '\r') {
      readline.moveCursor(process.stderr, 0, -1);
    }
  });
}

function writeStream(stream, rawLines) {
  process.stderr.write(stream);
  readline.moveCursor(process.stderr, 0, -rawLines.length);
}

function cleanStream(rawLines) {
  rawLines.forEach((lineLength, index) => {
    readline.moveCursor(process.stderr, lineLength , index);
    readline.clearLine(process.stderr, 1);
    readline.moveCursor(process.stderr, -lineLength, -index);
  });
  readline.moveCursor(process.stderr, 0, rawLines.length);
  readline.clearScreenDown(process.stderr);
  readline.moveCursor(process.stderr, 0, -rawLines.length);
}

module.exports = {
  purgeSpinnersOptions,
  purgeSpinnerOptions,
  colorOptions,
  breakText,
  preventBreakLines,
  writeStream,
  cleanStream,
}
