'use strict';

const VALID_STATUSES = ['success', 'fail', 'spinning', 'non-spinnable', 'stopped'];
const VALID_COLORS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];

function purgeInvalidOptions(options) {
  const { text, status, color } = options;
  if (!VALID_COLORS.includes(color)) delete options.color;
  if (!text || typeof text !== 'string') delete options.text;
  if (!VALID_STATUSES.includes(status)) delete options.status;

  return options;
}

function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

module.exports = {
  purgeInvalidOptions,
  isValidStatus,
}
