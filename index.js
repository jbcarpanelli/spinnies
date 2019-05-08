'use strict';

const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');

const MultiSpinner = {
  initialize(options = {}) {
    this.options = { 
      color: 'white',
      spinnerColor: 'greenBright',
      successColor: 'green',
      failColor: 'red',
      ...options
    };
    this.spinners = [];
    this.index = 0;
    this.isCursorHidden = false;
    this.currentInterval = null;
  },

  add(text, options = {}) {
    this.spinners.push({
      text,
      color: this.options.color,
      spinnerColor: this.options.spinnerColor,
      successColor: this.options.successColor,
      failColor: this.options.failColor,
      status: 'spinning',
      ...options,
      index: this.index,
    });
    this.index += 1;
    this.setOrUpdateSpinners();
    return { index: this.index - 1, spinners: this.spinners };
  },

  setOrUpdateSpinners() {
    clearInterval(this.currentInterval);
    this.hideCursor();
    const frames = ['-', '|'];
    const interval = 80;
    let cont = 0

    this.currentInterval = setInterval(() => {
      this.setStream(frames[cont]);
      if (cont === frames.length - 1) cont = 0
      else cont ++;
    }, interval)
  },

  setStream(frame) {
    let stream = '';
    let line = '';
    this.spinners.map(({ text, status, color, spinnerColor, successColor, failColor }) => {
      if (status === 'spinning') {
        line = `${chalk[spinnerColor](frame)} ${chalk[color](text)}`;
      } else if (status === 'success') {
        line = `${chalk.green('✓')} ${chalk[successColor](text)}`;
      } else if (status === 'fail') {
        line = `${chalk.red('✖')} ${chalk[failColor](text)}`;
      } else {
        line = `- ${chalk[color](text)}`;
      }
      stream += `${line}\n`;
    });
    this.writeStream(stream);
  },

  hideCursor() {
    if (!this.isCursorHidden) {
      cliCursor.hide();
      this.isCursorHidden = true;
    }
  },

  writeStream(stream) {
    process.stderr.write(stream);
    readline.moveCursor(process.stderr, 0, -this.spinners.length);
  },
}

module.exports = MultiSpinner;
