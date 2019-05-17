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
    this.spinners = {};
    this.isCursorHidden = false;
    this.currentInterval = null;
    this.enabled = this.options.enabled && process.stderr.isTTY && !process.env.NODE_ENV === 'test' && !process.env.CI
  },

  add(name, text, options = {}) {
    this.spinners[name] = {
      text,
      color: this.options.color,
      spinnerColor: this.options.spinnerColor,
      successColor: this.options.successColor,
      failColor: this.options.failColor,
      status: 'spinning',
      ...options,
    };
    this.setOrUpdateSpinners();
    return this.spinners[name];
  },

  update(name, newText, options = {}) {
    const { color } = options;
    if (color) this.spinners[name].color = color;
    this.spinners[name].text = newText;
    this.setOrUpdateSpinners();

    return this.spinners[name];
  },

  fail(name, failText, options = {}) {
    const { color } = options;
    if (color) this.spinners[name].color = color;
    if (failText) this.spinners[name].text = failText;
    this.spinners[name].status = 'fail';
    this.setOrUpdateSpinners();

    return this.spinners[name];
  },

  success(name, successText, options = {}) {
    const { color } = options;
    if (color) this.spinners[name].color = color;
    if (successText) this.spinners[name].text = successText;
    this.spinners[name].status = 'success';
    this.setOrUpdateSpinners();

    return this.spinners[name];
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
    Object.values(this.spinners)
      .map(({ text, status, color, spinnerColor, successColor, failColor }) => {
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
        Object.keys(this.spinners).forEach(() => console.log())
      }, interval + 1);
    }
  },

  hasActiveSpinners() {
    return !!Object.values(this.spinners)
      .find(({ status }) => status === 'spinning')
  },

  hideCursor() {
    if (!this.isCursorHidden) {
      cliCursor.hide();
      this.isCursorHidden = true;
    }
  },

  writeStream(stream) {
    Object.values(this.spinners)
      .forEach(({ text }, index) => {
        readline.moveCursor(process.stderr, text.length + 2, index);
        readline.clearLine(process.stderr, 1);
        readline.moveCursor(process.stderr, -(text.length + 2), -index);
      });
    process.stderr.write(stream);
    readline.moveCursor(process.stderr, 0, -Object.keys(this.spinners).length);
  },
}

process.on('SIGINT', function() {
  Object.keys(MultiSpinner.spinners).map(() => console.log())
  process.exit();
});

module.exports = MultiSpinner;
