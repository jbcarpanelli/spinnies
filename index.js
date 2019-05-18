'use strict';

const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const dots = require('./spinner');

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

  add(name, options = {}) {
    this.spinners[name] = {
      color: this.options.color,
      spinnerColor: this.options.spinnerColor,
      successColor: this.options.successColor,
      failColor: this.options.failColor,
      status: 'spinning',
      ...options,
    };
    this.updateSpinnerState();

    return this.spinners[name];
  },

  update(name, options = {}) {
    const { status } = options
    this.setSpinnerProperties(name, options, status);
    this.updateSpinnerState();

    return this.spinners[name];
  },

  success(name, options = {}) {
    this.setSpinnerProperties(name, options, 'success');
    this.updateSpinnerState();

    return this.spinners[name];
  },

  fail(name, options = {}) {
    this.setSpinnerProperties(name, options, 'fail');
    this.updateSpinnerState();

    return this.spinners[name];
  },

  setSpinnerProperties(name, options, status) {
    const { text, color, successColor, failColor, spinnerColor } = options;
    const properties = { text, color, successColor, failColor, spinnerColor, status };
    Object.keys(properties).forEach(key => {
      if (!properties[key]) delete properties[key];
    });

    this.spinners[name] = { ...this.spinners[name], ...properties };
  },

  updateSpinnerState(name, options = {}, status) {
    const { frames, interval } = dots;
    let cont = 0;

    clearInterval(this.currentInterval);
    this.hideCursor();
    this.currentInterval = setInterval(() => {
      this.setStream(frames[cont]);
      if (cont === frames.length - 1) cont = 0
      else cont ++;
    }, interval)

    this.checkIfActiveSpinners();
  },

  setStream(frame) {
    let line;
    let stream = '';

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
    const { interval } = dots;
    if (!this.hasActiveSpinners()) {
      setTimeout(() => {
        clearInterval(this.currentInterval);
        readline.moveCursor(process.stderr, 0, Object.keys(this.spinners).length);
      }, interval + 1);
    }
  },

  hasActiveSpinners() {
    return !!Object.values(this.spinners).find(({ status }) => status === 'spinning')
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
  Object.keys(MultiSpinner.spinners).forEach(() => console.log())
  process.exit();
});

module.exports = MultiSpinner;
