'use strict';

const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');

const MultiSpinner = {
  initialize(options = {}) {
    this.options = {
      color: 'white',
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
      status: 'spinning',
      color: 'white',
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
    this.spinners.map(({ text, status, color }) => {
      if (status === 'spinning') {
        line = `${chalk[color](frame)} ${chalk[color](text)}`;
      } else if (status === 'success') {
        line = `${chalk.green('✓')} ${chalk[color](text)}`;
      } else if (status === 'fail') {
        line = `${chalk.red('✖')} ${chalk[color](text)}`;
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
