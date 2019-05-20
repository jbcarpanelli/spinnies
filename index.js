'use strict';

const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const dots = require('./spinner');

const { purgeSpinnerOptions, purgeSpinnersOptions, colorOptions } = require('./utils');

class Spinners {
  constructor(options = {}) {
    options = purgeSpinnersOptions(options);
    this.options = { 
      color: 'white',
      spinnerColor: 'greenBright',
      successColor: 'green',
      failColor: 'red',
      spinner: dots,
      ...options
    };
    this.spinners = {};
    this.isCursorHidden = false;
    this.currentInterval = null;
  }

  pickSpinner(name) {
    return this.spinners[name];
  }

  add(name, options = {}) {
    if (typeof name !== 'string') throw Error('A spinner reference name must be specified');
    if (!options.text) options.text = name;
    this.spinners[name] = {
      ...colorOptions(this.options),
      status: 'spinning',
      ...purgeSpinnerOptions(options),
    };
    this.updateSpinnerState();
    return this.spinners[name];
  }

  update(name, options = {}) {
    const { status } = options;
    this.setSpinnerProperties(name, options, status);
    this.updateSpinnerState();

    return this.spinners[name];
  }

  success(name, options = {}) {
    this.setSpinnerProperties(name, options, 'success');
    this.updateSpinnerState();

    return this.spinners[name];
  }

  fail(name, options = {}) {
    this.setSpinnerProperties(name, options, 'fail');
    this.updateSpinnerState();

    return this.spinners[name];
  }

  stopAll() {
    Object.keys(this.spinners).forEach(name => {
      const { status } = this.spinners[name];
      if (status !== 'fail' && status !== 'success' && status !== 'non-spinnable') {
        this.spinners[name].status = 'stopped';
        this.spinners[name].color = 'grey';
      }
    });
    this.checkIfActiveSpinners();

    return this.spinners;
  }

  setSpinnerProperties(name, options, status) {
    if (typeof name !== 'string') throw Error('A spinner reference name must be specified');
    options = purgeSpinnerOptions(options);
    status = status || 'spinning';

    this.spinners[name] = { ...this.spinners[name], ...options, status };
  }

  updateSpinnerState(name, options = {}, status) {
    const { frames, interval } = this.options.spinner;
    let framePos = 0;

    clearInterval(this.currentInterval);
    this.hideCursor();
    this.currentInterval = setInterval(() => {
      this.setStream(frames[framePos]);
      if (framePos === frames.length - 1) framePos = 0
      else framePos ++;
    }, interval)

    this.checkIfActiveSpinners();
  }

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
  }

  checkIfActiveSpinners() {
    const { interval } = this.options.spinner;
    if (!this.hasActiveSpinners()) {
      setTimeout(() => {
        clearInterval(this.currentInterval);
        readline.moveCursor(process.stderr, 0, Object.keys(this.spinners).length);
        cliCursor.show();
      }, interval + 1);
    }
  }

  hasActiveSpinners() {
    return !!Object.values(this.spinners)
      .find(({ status }) => status === 'spinning')
  }

  hideCursor() {
    if (!this.isCursorHidden) {
      cliCursor.hide();
      this.isCursorHidden = true;
    }
  }

  writeStream(stream) {
    Object.values(this.spinners).forEach(({ text }, index) => {
      readline.moveCursor(process.stderr, text.length + 2, index);
      readline.clearLine(process.stderr, 1);
      readline.moveCursor(process.stderr, -(text.length + 2), -index);
    });
    process.stderr.write(stream);
    readline.moveCursor(process.stderr, 0, -Object.keys(this.spinners).length);
  }
}

module.exports = Spinners;
