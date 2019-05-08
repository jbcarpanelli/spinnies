'use strict';

const readline = require('readline');
const cliCursor = require('cli-cursor');
const chalk = require('chalk');

const MultiSpinner = {
  initialize(options = {}) {
    this.options = options;
    this.spinners = [];
    this.index = 0;
    this.isCursorHidden = false;
    this.currentInterval = null;
  },

  add(text, options = {}) {
    this.spinners.push({
      text,
      status: 'spinning',
      color: 'green',
      ...options,
      index: this.index,
    });
    this.index += 1;
    return { index: this.index - 1, spinners: this.spinners };
  },

  setOrUpdateSpinners() {
    clearInterval(this.currentInterval);
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

  writeStream(stream) {
    process.stderr.write(stream);
    readline.moveCursor(process.stderr, 0, -this.spinners.length);
  },
}

process.on('SIGINT', function() {
  MultiSpinner.spinners.map(() => console.log())
  process.exit();
});

module.exports = MultiSpinner;
