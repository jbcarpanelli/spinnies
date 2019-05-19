'use strict';

const VALID_STATUSES = ['success', 'fail', 'spinning', 'non-spinnable', 'stopped'];
const VALID_COLORS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];

function purgeSpinnerOptions(options) {
  const { text, status, color } = options;
  if (!VALID_COLORS.includes(color)) delete options.color;
  if (!text || typeof text !== 'string') delete options.text;
  if (!VALID_STATUSES.includes(status)) delete options.status;

  return options;
}

function purgeSpinnersOptions(options) {
  const { color, successColor, failColor, spinnerColor, spinner } = options;
  const colors = { color, successColor, failColor, spinnerColor };
  Object.keys(colors).forEach(key => {
    if (!VALID_COLORS.includes(colors[key])) delete colors[key];
  });

  return isValidSpinner(spinner) ? { ...colors, spinner } : colors;
}

function isValidSpinner(spinner = {}) {
  const { interval, frames } = spinner;
  return typeof spinner === 'object' && Array.isArray(frames) && frames.length > 0 && typeof interval === 'number';
}

function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

module.exports = {
  purgeSpinnersOptions,
  purgeSpinnerOptions,
  isValidStatus,
}
