'use strict';

const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const spinnerDots = require('./spinner');

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
    this.enabled = this.options.enabled && process.stderr.isTTY && !process.env.NODE_ENV === 'test' && !process.env.CI
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

  update(currentIndex, newText, options = {}) {
    const { color } = options;
    if (color) this.spinners[currentIndex].color = color;
    this.spinners[currentIndex].text = newText;
    this.setOrUpdateSpinners();

    return this.spinners[currentIndex];
  },

  fail(currentIndex, failText, options = {}) {
    const { color } = options;
    if (color) this.spinners[currentIndex].color = color;
    if (failText) this.spinners[currentIndex].text = failText;
    this.spinners[currentIndex].status = 'fail';
    this.setOrUpdateSpinners();

    return this.spinners[currentIndex];
  },

  success(currentIndex, successText, options = {}) {
    const { color } = options;
    if (color) this.spinners[currentIndex].color = color;
    if (successText) this.spinners[currentIndex].text = successText;
    this.spinners[currentIndex].status = 'success';
    this.setOrUpdateSpinners();

    return this.spinners[currentIndex];
  },

  setOrUpdateSpinners() {
    clearInterval(this.currentInterval);
    this.hideCursor();
    const { frames, interval } = spinnerDots;
    let cont = 0

    this.currentInterval = setInterval(() => {
      this.setStream(frames[cont]);
      if (cont === frames.length - 1) cont = 0
      else cont ++;
    }, interval)

    this.checkIfActiveSpinners();
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

  checkIfActiveSpinners() {
    const { interval } = spinnerDots;
    if (!this.hasActiveSpinners()) {
      setTimeout(() => {
        clearInterval(this.currentInterval);
        this.currentInterval = null;
        this.spinners.forEach(() => console.log())
      }, interval + 1);
    }
  },

  hasActiveSpinners() {
    return !!this.spinners.find(({ status }) => status === 'spinning')
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

process.on('SIGINT', function() {
  MultiSpinner.spinners.map(() => console.log())
  process.exit();
});

module.exports = MultiSpinner;
