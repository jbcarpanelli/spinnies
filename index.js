'use strict';
const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const { dashes, dots } = require('./spinners');

const { indentText, turnToValidSpinner, purgeSpinnerOptions, purgeSpinnersOptions, colorOptions, breakText, getLinesLength, terminalSupportsUnicode } = require('./utils');
const { isValidStatus, writeStream, cleanStream } = require('./utils');

class Spinnies {
  constructor(options = {}) {
    options = purgeSpinnersOptions(options);
    this.options = {
      spinnerColor: 'greenBright',
      succeedColor: 'green',
      failColor: 'red',
      spinner: terminalSupportsUnicode() ? dots : dashes,
      disableSpins: false,
      ...options
    };
    this.logs = [];
    this.spinners = {};
    this.isCursorHidden = false;
    this.currentInterval = null;
    this.stream = process.stderr;
    this.lineCount = 0;
    this.currentFrameIndex = 0;
    this.spin = !this.options.disableSpins && !process.env.CI && process.stderr && process.stderr.isTTY;
    this.bindSigint();
  }

  addLog(str) {
    this.logs.push(str);
  }

  pick(name) {
    return this.spinners[name];
  }

  setFrames(frames) {
    const spinner = turnToValidSpinner(frames);
    this.options.spinner = spinner;
    this.currentFrameIndex = 0;
    this.updateSpinnerState();

    return this;
  }

  add(name, options = {}) {
    if (typeof name !== 'string') throw Error('A spinner reference name must be specified');
    if (!options.text) options.text = name;
    const spinnerProperties = {
      ...colorOptions(this.options),
      succeedPrefix: this.options.succeedPrefix,
      failPrefix: this.options.failPrefix,
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

  succeed(name, options = {}) {
    this.setSpinnerProperties(name, options, 'succeed');
    this.updateSpinnerState();

    return this.spinners[name];
  }

  fail(name, options = {}) {
    this.setSpinnerProperties(name, options, 'fail');
    this.updateSpinnerState();

    return this.spinners[name];
  }

  remove(name) {
    delete this.spinners[name]
    this.updateSpinnerState();
  }

  stopAll(newStatus = 'stopped') {
    Object.keys(this.spinners).forEach(name => {
      const { status: currentStatus } = this.spinners[name];
      if (currentStatus !== 'fail' && currentStatus !== 'succeed' && currentStatus !== 'non-spinnable') {
        if (newStatus === 'succeed' || newStatus === 'fail') {
          this.spinners[name].status = newStatus;
          this.spinners[name].color = this.options[`${newStatus}Color`];
        } else {
          this.spinners[name].status = 'stopped';
          this.spinners[name].color = 'grey';
        }
      }
    });
    this.checkIfActiveSpinners();

    return this.spinners;
  }

  hasActiveSpinners() {
    return !!Object.values(this.spinners).find(({ status }) => status === 'spinning');
  }

  setSpinnerProperties(name, options, status) {
    if (typeof name !== 'string') throw Error('A spinner reference name must be specified');
    if (!this.spinners[name]) throw Error(`No spinner initialized with name ${name}`);
    options = purgeSpinnerOptions(options);
    status = status || 'spinning';

    this.spinners[name] = { ...this.spinners[name], ...options, status };
  }

  updateSpinnerState(name, options = {}, status) {
    if (this.spin) {
      clearInterval(this.currentInterval);
      this.currentInterval = this.loopStream();
      if (!this.isCursonHidden) cliCursor.hide();
      this.isCursorHidden = true;
      this.checkIfActiveSpinners();
    } else {
      this.setRawStreamOutput();
    }
  }

  loopStream() {
    const { frames, interval } = this.options.spinner;
    return setInterval(() => {
      this.setStreamOutput(frames[this.currentFrameIndex]);
      this.currentFrameIndex = this.currentFrameIndex === frames.length - 1 ? 0 : ++this.currentFrameIndex
    }, interval);
  }

  setStreamOutput(frame = '') {
    let output = '';
    const linesLength = [];
    const hasActiveSpinners = this.hasActiveSpinners();
    Object
      .values(this.spinners)
      .map(({ text, status, color, spinnerColor, succeedColor, failColor, succeedPrefix, failPrefix }) => {
        let line;
        let prefixLength;
        if (status === 'spinning') {
          prefixLength = frame.length + 1;
          text = breakText(text, prefixLength);
          text = indentText(text, prefixLength, this.logs);
          line = `${chalk[spinnerColor](frame)} ${color ? chalk[color](text) : text}`;
        } else {
          if (status === 'succeed') {
            prefixLength = succeedPrefix.length + 1;
            if (hasActiveSpinners) text = breakText(text, prefixLength);
            text = indentText(text, prefixLength);
            line = `${chalk.green(succeedPrefix)} ${chalk[succeedColor](text)}`;
          } else if (status === 'fail') {
            prefixLength = failPrefix.length + 1;
            if (hasActiveSpinners) text = breakText(text, prefixLength);
            text = indentText(text, prefixLength);
            line = `${chalk.red(failPrefix)} ${chalk[failColor](text)}`;
          } else {
            prefixLength = 0;
            if (hasActiveSpinners) text = breakText(text, prefixLength);
            text = indentText(text, prefixLength);
            line = color ? chalk[color](text) : text;
          }
        }

        linesLength.push(...getLinesLength(text, prefixLength));
        output += `${line}\n`;
      });

    if(!hasActiveSpinners) readline.clearScreenDown(this.stream);
    writeStream(this.stream, output, linesLength);
    if (hasActiveSpinners) cleanStream(this.stream, linesLength);
    this.lineCount = linesLength.length;
  }

  setRawStreamOutput() {
    Object.values(this.spinners).forEach(i => {
      process.stderr.write(`- ${i.text}\n`);
    });
  }

  checkIfActiveSpinners() {
    if (!this.hasActiveSpinners()) {
      if (this.spin) {
        this.setStreamOutput();
        readline.moveCursor(this.stream, 0, this.lineCount);
        clearInterval(this.currentInterval);
        this.isCursorHidden = false;
        cliCursor.show();
      }
      this.spinners = {};
    }
  }

  bindSigint(lines) {
    process.removeAllListeners('SIGINT');
    process.on('SIGINT', () => {
      cliCursor.show();
      readline.moveCursor(process.stderr, 0, this.lineCount);
      process.exit(0);
    });
  }

  log(method = console.log) {
    this.logs.forEach((log) => method(log));
  }

  getLogs() {
    return this.logs;
  }
}

module.exports = Spinnies;
module.exports.dots = dots;
module.exports.dashes = dashes;
