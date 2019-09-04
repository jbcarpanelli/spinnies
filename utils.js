'use strict';

const readline = require('readline');
const stripAnsi = require('strip-ansi');
const wordwrapjs = require('wordwrapjs')
const EOL = require('os').EOL;
const { dashes, dots } = require('./spinners');
const { purgeOptions, some, equal, type, oneOf } = require('./purgeOptions');

let symbols;
if (terminalSupportsUnicode()) {
  symbols = {
    succeedPrefix: '✓',
    failPrefix: '✖',
    warnPrefix: '⚠',
    infoPrefix: 'ℹ'
  };
} else {
  symbols = {
    succeedPrefix: '√',
    failPrefix: '×',
    warnPrefix: '!!',
    infoPrefix: 'i'
  };
}

const VALID_COLORS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];
const isValidPrefix = some([
  equal(false),
  type('string'),
  type('number')
]);
const isValidColor = oneOf(VALID_COLORS);

function purgeSpinnerOptions(options) {
  const purged = purgeOptions({
    status: type('string'),
    text: type('string'),
    indent: type('number'),
    hidden: type('boolean')
  }, options);
  const colors = colorOptions(options);

  return { ...colors, ...purged };
}

function purgeSpinnersOptions({ spinner, disableSpins, ...others }) {
  const colors = colorOptions(others);
  const prefixes = prefixOptions(others);
  const disableSpinsOption = typeof disableSpins === 'boolean' ? { disableSpins } : {};
  spinner = turnToValidSpinner(spinner);

  return { ...colors, ...prefixes, ...disableSpinsOption, spinner }
}

function statusOptionsFromNormalUpdate(opts) {
  // for compatibility with update();
  const { succeedColor, succeedPrefix, failColor, failPrefix, warnColor, warnPrefix, infoColor, infoPrefix, color, spinnerColor } = opts;

  let shouldSetFail = false;
  const failSet = {};
  let shouldSetSucceed = false;
  const succeedSet = {};
  let shouldSetDefault = false;
  const defaultSet = {};
  let shouldSetWarn = false;
  const warnSet = {};
  let shouldSetInfo = false;
  const infoSet = {};

  if (isValidPrefix(failPrefix)) {
    shouldSetFail = true;
    failSet.prefix = failPrefix;
  }
  if (isValidColor(failColor)) {
    shouldSetFail = true;
    failSet.prefixColor = failColor;
    failSet.textColor = failColor;
  }

  if (isValidPrefix(succeedPrefix)) {
    shouldSetSucceed = true;
    succeedSet.prefix = succeedPrefix;
  }
  if (isValidColor(succeedColor)) {
    shouldSetSucceed = true;
    succeedSet.prefixColor = succeedColor;
    succeedSet.textColor = succeedColor;
  }

  if (isValidPrefix(warnPrefix)) {
    shouldSetWarn = true;
    warnSet.prefix = warnPrefix;
  }
  if (isValidColor(warnColor)) {
    shouldSetWarn = true;
    warnSet.prefixColor = warnColor;
    warnSet.textColor = warnColor;
  }

  if (isValidPrefix(infoPrefix)) {
    shouldSetInfo = true;
    infoSet.prefix = infoPrefix;
  }
  if (isValidColor(infoColor)) {
    shouldSetInfo = true;
    infoSet.prefixColor = infoColor;
    infoSet.textColor = infoColor;
  }

  if (isValidColor(spinnerColor)) {
    shouldSetDefault = true;
    defaultSet.spinnerColor = spinnerColor;
    defaultSet.prefixColor = spinnerColor;
  }

  if (isValidColor(color)) {
    shouldSetDefault = true;
    defaultSet.textColor = color;
  }

  return { shouldSetDefault, shouldSetFail, shouldSetSucceed, shouldSetWarn, shouldSetInfo, defaultSet, failSet, succeedSet, warnSet, infoSet };
}

function purgeStatusOptions(options) {
  return purgeOptions({
    prefix: isValidPrefix,
    prefixColor: isValidColor,
    spinnerColor: isValidColor,
    textColor: isValidColor,
    isStatic: type('boolean'),
    noSpaceAfterPrefix: type('boolean'),
    isDone: type('boolean')
  }, options);
}

function turnToValidSpinner(spinner = {}) {
  const platformSpinner = terminalSupportsUnicode() ? dots : dashes;

  if (typeof spinner === 'string') {
    try {
      const cliSpinners = require('cli-spinners');
      const selectedSpinner = cliSpinners[spinner];

      if (selectedSpinner) {
        return selectedSpinner;
      }

      return platformSpinner; // The spinner doesn't exist in the cli-spinners library
    } catch {
      // cli-spinners is not installed, ignore :
      return platformSpinner;
    }

  }

  if (!typeof spinner === 'object') return platformSpinner;
  let { interval, frames } = spinner;
  if (!Array.isArray(frames) || frames.length < 1) frames = platformSpinner.frames;
  if (typeof interval !== 'number') interval = platformSpinner.interval;

  return { interval, frames };
}

function colorOptions(options) {
  return purgeOptions({
    color: isValidColor,
    succeedColor: isValidColor,
    failColor: isValidColor,
    warnColor: isValidColor,
    infoColor: isValidColor,
    spinnerColor: isValidColor
  }, options);
}

function prefixOptions(prefixes) {
  const purgedPrefixes = purgeOptions({
    succeedPrefix: isValidPrefix,
    failPrefix: isValidPrefix,
    warnPrefix: isValidPrefix,
    infoPrefix: isValidPrefix
  }, prefixes);

  return { ...symbols, ...purgedPrefixes };
}

function breakText(text, prefixLength, indent = 0) {
  const columns = process.stderr.columns || 95;

  return wordwrapjs.wrap(text, { break: true, width: (columns - prefixLength - indent - 1) });
}

function indentText(text, prefixLength, indent = 0) {
  if (!prefixLength && !indent) return text;

  const repeater = (index) => ' '.repeat((index !== 0) ? (prefixLength + indent) : 0);

  return text
    .split(/\r\n|\r|\n/)
    .map((line, index) => `${repeater(index)}${line}`)
    .join(EOL);
}

function secondStageIndent(str, indent = 0) {
  return `${' '.repeat(indent)}${str}`; // Indent the prefix after it was added
}


function getLinesLength(text, prefixLength, indent = 0) {
  return stripAnsi(text)
    .split(/\r\n|\r|\n/)
    .map((line, index) => index === 0 ? line.length + prefixLength + indent : line.length);
}

function writeStream(stream, output, rawLines) {
  stream.write(output);
  readline.moveCursor(stream, 0, -rawLines.length);
}

function cleanStream(stream, rawLines) {
  rawLines.forEach((lineLength, index) => {
    readline.moveCursor(stream, lineLength, index);
    readline.clearLine(stream, 1);
    readline.moveCursor(stream, -lineLength, -index);
  });
  readline.moveCursor(stream, 0, rawLines.length);
  readline.clearScreenDown(stream);
  readline.moveCursor(stream, 0, -rawLines.length);
}

function terminalSupportsUnicode() {
    // The default command prompt and powershell in Windows do not support Unicode characters.
    // However, the VSCode integrated terminal and the Windows Terminal both do.
    return process.platform !== 'win32'
      || process.env.TERM_PROGRAM === 'vscode'
      || !!process.env.WT_SESSION
}

function isError(err) {
  return err && err.message && err.stack;
}

const isCI = // Taken from ci-info [https://github.com/watson/ci-info]
  process.env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari
  process.env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
  process.env.BUILD_NUMBER || // Jenkins, TeamCity
  process.env.RUN_ID || // TaskCluster, dsari
  false;

module.exports = {
  purgeSpinnersOptions,
  purgeSpinnerOptions,
  purgeStatusOptions,
  prefixOptions,
  colorOptions,
  breakText,
  getLinesLength,
  writeStream,
  cleanStream,
  terminalSupportsUnicode,
  turnToValidSpinner,
  indentText,
  secondStageIndent,
  statusOptionsFromNormalUpdate,
  isCI,
  isError
}
