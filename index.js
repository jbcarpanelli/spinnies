'use strict';

const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const { dots } = require('./spinners');

const { purgeSpinnerOptions, purgeSpinnersOptions, colorOptions, breakText, getLinesLength } = require('./utils');
const { writeStream, cleanStream } = require('./utils');

class Spinnies {
  constructor(options = {}) {
    options = purgeSpinnersOptions(options);
    this.options = { 
      color: 'white',
      spinnerColor: 'greenBright',
      succeedColor: 'green',
      failColor: 'red',
      spinner: dots,
      disableSpins: false,
      ...options
    };
    this.spinners = {};
    this.isCursorHidden = false;
    this.currentInterval = null;
    this.stream = process.stderr;
    this.lineCount = 0;
    this.spin = !this.options.disableSpins && !process.env.CI && process.stderr && process.stderr.isTTY;
    this.bindSigint();
  }

  pick(name) {
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

  stopAll() {
    Object.keys(this.spinners).forEach(name => {
      const { status } = this.spinners[name];
      if (status !== 'fail' && status !== 'succeed' && status !== 'non-spinnable') {
        this.spinners[name].status = 'stopped';
        this.spinners[name].color = 'grey';
      }
    });
    this.checkIfActiveSpinners();

    return this.spinners;
  }

  hasActiveSpinners() {
    return !!Object.values(this.spinners).find(({ status }) => status === 'spinning')
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
    let framePos = 0;
    return setInterval(() => {
      this.setStreamOutput(frames[framePos]);
      framePos = framePos === frames.length - 1 ? 0 : ++framePos
    }, interval);
  }

  setStreamOutput(frame = '') {
    let line;
    let output = '';
    const linesLength = [];
    Object.values(this.spinners).map(({ text, status, color, spinnerColor, succeedColor, failColor }) => {
      let prefixLength = 2;
      if (status === 'spinning') {
        prefixLength = frame.length + 1;
        text = breakText(text, prefixLength);
        line = `${chalk[spinnerColor](frame)} ${chalk[color](text)}`;
      } else {
        text = breakText(text, prefixLength);
        if (status === 'succeed') {
          line = `${chalk.green('✓')} ${chalk[succeedColor](text)}`;
        } else if (status === 'fail') {
          line = `${chalk.red('✖')} ${chalk[failColor](text)}`;
        } else {
          line = `- ${chalk[color](text)}`;
        }
      }
      linesLength.push(...getLinesLength(text, prefixLength));
      output += `${line}\n`;
    });

    writeStream(this.stream, output, linesLength);
    cleanStream(this.stream, linesLength);
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
}

module.exports = Spinnies;
