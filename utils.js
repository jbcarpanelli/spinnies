'use strict';

const readline = require('readline');
const stripAnsi = require('strip-ansi');
const wordwrapjs = require('wordwrapjs')
const EOL = require('os').EOL;
const { dashes, dots } = require('./spinners');

const VALID_STATUSES = ['succeed', 'fail', 'spinning', 'non-spinnable', 'stopped'];
const VALID_COLORS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];

function isValidPrefix(prefix) {
  return (prefix === false || typeof prefix === 'string' || typeof prefix === 'number');
}

function isValidColor(color) {
  return VALID_COLORS.includes(color);
}

function purgeSpinnerOptions(options) {
  const { text, status, indent } = options;
  const opts = { text, status, indent };
  const colors = colorOptions(options);

  if (!VALID_STATUSES.includes(status)) delete opts.status;
  if (typeof text !== 'string') delete opts.text;
  if (typeof indent !== 'number') delete opts.indent;

  return { ...colors, ...opts };
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
  const { succeedColor, succeedPrefix, failColor, failPrefix, color } = opts;

  let shouldSetFail = false;
  const failSet = {};
  let shouldSetSucceed = false;
  const succeedSet = {};
  let shouldSetDefault = false;
  const defaultSet = {};

  if(isValidPrefix(failPrefix)) {
    shouldSetFail = true;
    failSet.prefix = failPrefix;
  }
  if(isValidColor(failColor)) {
    shouldSetFail = true;
    failSet.prefixColor = failColor;
    failSet.textColor = failColor;
  }

  if(isValidPrefix(succeedPrefix)) {
    shouldSetSucceed = true;
    succeedSet.prefix = succeedPrefix;
  }
  if(isValidColor(succeedColor)) {
    shouldSetSucceed = true;
    succeedSet.prefixColor = succeedColor;
    succeedSet.textColor = succeedColor;
  }

  if(isValidColor(color)) {
    shouldSetDefault = true;
    defaultSet.textColor = color;
    defaultSet.spinnerColor = color;
  }

  return { shouldSetDefault, shouldSetFail, shouldSetSucceed, defaultSet, failSet, succeedSet };
}

function purgeStatusOptions(opts) {
  const {
    prefix,
    prefixColor,
    spinnerColor,
    textColor,
    isStatic,
    noSpaceAfterPrefix,
    rawRender
  } = opts;

  const options = {
    prefix,
    prefixColor,
    spinnerColor,
    textColor,
    isStatic,
    noSpaceAfterPrefix,
    rawRender
  };

  if (rawRender) {
    // to improve static rendering on CI and when spin is disabled
    if (typeof rawRender === 'function') {
      // the function will return the message
      const res = rawRender({ statusOptions : {}}); // TODO: placeholder
      if (typeof res !== 'string') delete options.rawRender;
    } else if (typeof rawRender !== 'string') {
      // if it's not a function it must be a string, well if it isn't it's invalid
      delete options.rawRender;
    }
  } else {
    delete options.rawRender;
  }

  if (!isValidPrefix(options.prefix)) {
    delete options.prefix;
  }

  if(options.isStatic !== undefined) {
    options.isStatic = !!options.isStatic;
  } else {
    delete options.isStatic
  }

  if(options.noSpaceAfterPrefix !== undefined) {
    options.noSpaceAfterPrefix = !!options.noSpaceAfterPrefix;
  } else {
    delete options.noSpaceAfterPrefix
  }

  ['prefixColor', 'spinnerColor', 'textColor'].forEach((color) => {
    if(!isValidColor(options[color])) {
      delete options[color];
    }
  });

  return options;
}

function turnToValidSpinner(spinner = {}) {
  const platformSpinner = terminalSupportsUnicode() ? dots : dashes;

  if (typeof spinner === 'string') {
    try {
      const cliSpinners = require('cli-spinners');
      const selectedSpinner = cliSpinners[spinner];

      if(selectedSpinner) {
        return selectedSpinner;
      }

      return platformSpinner; // The spinner doesn't exist in the cli-spinners library
    } catch {
      // cli-spinners is not installed, ignore error
      return platformSpinner;
    }

  }

  if (!typeof spinner === 'object') return platformSpinner;
  let { interval, frames } = spinner;
  if (!Array.isArray(frames) || frames.length < 1) frames = platformSpinner.frames;
  if (typeof interval !== 'number') interval = platformSpinner.interval;

  return { interval, frames };
}

function colorOptions({ color, succeedColor, failColor, spinnerColor }) {
  const colors = { color, succeedColor, failColor, spinnerColor };
  Object.keys(colors).forEach(key => {
    if (!isValidColor(colors[key])) delete colors[key];
  });

  return colors;
}

function prefixOptions({ succeedPrefix, failPrefix }) {
  if(terminalSupportsUnicode()) {
    succeedPrefix = succeedPrefix || '✓';
    failPrefix = failPrefix || '✖';
  } else {
    succeedPrefix = succeedPrefix || '√';
    failPrefix = failPrefix || '×';
  }

  return { succeedPrefix, failPrefix };
}

function breakText(text, prefixLength, indent = 0) {
  const columns = process.stderr.columns || 95;

  return wordwrapjs.wrap(text, { width: (columns - prefixLength - indent - 1) });
}

function indentText(text, prefixLength, indent = 0) {
  if(!prefixLength && !indent) return text;

  const repeater = (index) => ' '.repeat((index !== 0) ? (prefixLength + indent) : 0);

  return text
    .split(EOL)
    .map((line, index) => `${repeater(index)}${line}`)
    .join(EOL);
}

function secondStageIndent(str, indent = 0) {
  return `${' '.repeat(indent)}${str}`; // Indent the prefix after it was added
}


function getLinesLength(text, prefixLength, indent = 0) {
  return stripAnsi(text)
    .split(EOL)
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
  statusOptionsFromNormalUpdate
}
