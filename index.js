'use strict';

const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const dots = require('./spinner');

const { purgeSpinnerOptions, purgeSpinnersOptions, colorOptions, breakText, getLinesLength } = require('./utils');
const { disableEnterKey, writeStream, cleanStream } = require('./utils');

class Spinners {
  constructor(options = {}) {
    options = purgeSpinnersOptions(options);
    this.options = { 
      color: 'white',
      spinnerColor: 'greenBright',
      successColor: 'green',
      failColor: 'red',
      spinner: dots,
      disableEnterKey: false,
      ...options
    };
    this.spinners = {};
    this.isCursorHidden = false;
    this.wasEnterKeyEnabled = false;
    this.isEnterKeyEnabled = false;
    this.currentInterval = null;
  }

  pickSpinner(name) {
    return this.spinners[name];
  }

  add(name, options = {}) {
    if (typeof name !== 'string') throw Error('A spinner reference name must be specified');
    if (!options.text) options.text = name;
    const spinnerProperties = {
      ...colorOptions(this.options),
      status: 'spinning',
      ...purgeSpinnerOptions(options),
    };
    this.spinners[name] = spinnerProperties;
    this.updateSpinnerState();

    return spinnerProperties;
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
    if (!this.spinners[name]) throw Error(`No spinner initialized with name ${name}`);
    options = purgeSpinnerOptions(options);
    status = status || 'spinning';

    this.spinners[name] = { ...this.spinners[name], ...options, status };
  }

  updateSpinnerState(name, options = {}, status) {
    const { frames, interval } = this.options.spinner;
    let framePos = 0;

    clearInterval(this.currentInterval);
    this.toggleCursor();
    this.enableEnterKey();
    this.currentInterval = setInterval(() => {
      this.setStream(frames[framePos]);
      if (framePos === frames.length - 1) framePos = 0
      else framePos ++;
    }, interval)

    this.checkIfActiveSpinners();
  }

  setStream(frame = '') {
    let line;
    let stream = '';
    const linesLength = [];
    Object.values(this.spinners).map(({ text, status, color, spinnerColor, successColor, failColor }) => {
      let prefixLength = 2;
      if (status === 'spinning') {
        prefixLength = frame.length + 1;
        text = breakText(text, prefixLength);
        line = `${chalk[spinnerColor](frame)} ${chalk[color](text)}`;
      } else {
        text = breakText(text, prefixLength);
        if (status === 'success') {
          line = `${chalk.green('✓')} ${chalk[successColor](text)}`;
        } else if (status === 'fail') {
          line = `${chalk.red('✖')} ${chalk[failColor](text)}`;
        } else {
          line = `- ${chalk[color](text)}`;
        }
      }
      linesLength.push(...getLinesLength(text, prefixLength));
      stream += `${line}\n`;
    });

    writeStream(stream, linesLength);
    cleanStream(linesLength);
  }

  checkIfActiveSpinners() {
    const { interval } = this.options.spinner;
    if (!this.hasActiveSpinners()) {
      clearInterval(this.currentInterval);
      this.setStream();
      readline.moveCursor(process.stderr, 0, Object.keys(this.spinners).length);
      this.spinners = {};
      this.toggleCursor();
      this.disableEnterKey();
    }
  }

  hasActiveSpinners() {
    return !!Object.values(this.spinners).find(({ status }) => status === 'spinning')
  }

  toggleCursor() {
    this.isCursorHidden && !this.hasActiveSpinners() ? cliCursor.show() : cliCursor.hide();
    this.isCursorHidden = !this.isCursorHidden;
  }

  enableEnterKey() {
    if (this.options.disableEnterKey && !this.isEnterKeyEnabled) {
      this.wasEnterKeyEnabled ? process.stdin.resume() : disableEnterKey();
      this.isEnterKeyEnabled = true;
      this.wasEnterKeyEnabled = true;
    }
  }

  disableEnterKey() {
    if (this.options.disableEnterKey) {
      this.isEnterKeyEnabled = false;
      process.stdin.pause();
    }
  }
}

module.exports = Spinners;
