'use strict';

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

module.exports = {
  purgeSpinnersOptions,
  purgeSpinnerOptions,
  colorOptions,
}
