'use strict';
const readline = require('readline');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const onExit = require('signal-exit')
const EventEmitter = require('events').EventEmitter;
const EOL = require('os').EOL;
const { dashes, dots } = require('./spinners');

const { statusOptionsFromNormalUpdate, secondStageIndent, indentText, turnToValidSpinner, purgeSpinnerOptions, purgeSpinnersOptions, purgeStatusOptions, colorOptions, prefixOptions, breakText, getLinesLength, terminalSupportsUnicode } = require('./utils');
const { isValidStatus, writeStream, cleanStream } = require('./utils');

const DEFAULT_STATUS = 'spinning';

class StatusRegistry {
  constructor(defaultStatus) {
    this.defaultStatus = defaultStatus;
    this.statuses = {};
    this.statusesAliases = {};
  }

  configureStatus(name, statusOptions = {}) {
    if (!name) throw new Error('Status name must be a string');
    let { aliases } = statusOptions;
    const existingStatus = this.statuses[name] || {};
    const purgedOptions = purgeStatusOptions(statusOptions);

    const opts = {
      prefix: false,
      isStatic: false,
      noSpaceAfterPrefix: false,
      spinnerColor: 'cyan',
      prefixColor: 'cyan',
      textColor: false,
      ...existingStatus,
      ...purgedOptions
    }

    this.statuses[name] = opts;

    if (aliases) {
      aliases = Array.isArray(aliases) ? aliases : [aliases];
      aliases.forEach(aliasName => {
        if (typeof aliasName !== 'string') return;
        this.statusesAliases[aliasName] = name;
      });
    }

    return this;
  }

  getStatus(name) {
    const status = this.statuses[name];
    if (status) {
      return status;
    }

    const fromAlias = this.statusesAliases[name];
    if (fromAlias && this.statuses[fromAlias]) {
      return this.statuses[fromAlias];
    }

    return this.statuses[this.defaultStatus];
  }

  actualName(nameOrAlias) {
    if (this.statuses[nameOrAlias]) return nameOrAlias;
    return this.statusesAliases[nameOrAlias];
  }
};

class Spinnie extends EventEmitter {
  constructor({ name, options, inheritedOptions, statusRegistry, logs }) {
    super();

    if (!options.text) options.text = name;
    const spinnerProperties = {
      ...colorOptions(inheritedOptions),
      succeedPrefix: inheritedOptions.succeedPrefix,
      failPrefix: inheritedOptions.failPrefix,
      status: 'spinning',
      ...purgeSpinnerOptions(options),
    };

    this.logs = logs;
    this.options = spinnerProperties;
    this.statusRegistry = statusRegistry;
    this.statusOverrides = {};

    this.applyStatusOverrides(spinnerProperties);

    return this;
  }

  update(options = {}) {
    const { status } = options;
    this.setSpinnerProperties(options, status);
    this.updateSpinnerState();

    return this;
  }

  status(statusName) {
    if (!statusName || typeof statusName !== 'string') return this;
    this.options.status = statusName;
    this.updateSpinnerState();

    return this;
  }

  succeed(options = {}) {
    this.setSpinnerProperties(options, 'succeed');
    this.updateSpinnerState();

    return this;
  }

  fail(options = {}) {
    this.setSpinnerProperties(options, 'fail');
    this.updateSpinnerState();

    return this;
  }

  remove() {
    this.emit('removeMe');
  }

  applyStatusOverrides(opts) {
    const { shouldSetDefault, shouldSetFail, shouldSetSucceed, defaultSet, failSet, succeedSet } = statusOptionsFromNormalUpdate(opts);

    if (shouldSetDefault) {
      const current = this.statusOverrides['spinning'] || {};
      this.statusOverrides['spinning'] = { ...current, ...defaultSet };
    }
    if (shouldSetFail) {
      const current = this.statusOverrides['fail'] || {};
      this.statusOverrides['fail'] = { ...current, ...failSet };
    }
    if (shouldSetSucceed) {
      const current = this.statusOverrides['success'] || {};
      this.statusOverrides['success'] = { ...current, ...succeedSet };
    }
  }

  isActive() {
    return !this.getStatus(this.options.status).isStatic;
  }

  rawRender() {
    const status = this.getStatus(this.options.status);
    const text = this.options.text;
    let output = `${status.prefix ? (chalk[status.prefixColor](status.prefix) + (status.noSpaceAfterPrefix ? '' : ' ')) : ''}${status.textColor ? chalk[status.textColor](text) : text}`;

    const indent = this.options.indent;
    let prefixLengthToIndent = 0;
    if (status.prefix) {
      // only if we have a prefix...
      prefixLengthToIndent = status.prefix.length;
      if (!status.noSpaceAfterPrefix) {
        // if we have a space after the prefix add 1 to the prefix length
        prefixLengthToIndent += 1;
      }
    }

    output = breakText(output, 0, indent);
    output = indentText(output, prefixLengthToIndent, indent);
    output = secondStageIndent(output, indent);

    return output;
  }

  render(frame) {
    let { text, status, indent } = this.options;
    const statusOptions = this.getStatus(status);
    let line;
    let prefix = '';

    if (!statusOptions.isStatic) {
      prefix = frame;
      if (!statusOptions.noSpaceAfterPrefix) {
        prefix += ' ';
      }
    } else if (statusOptions.prefix) {
      prefix = statusOptions.prefix;
      if (!statusOptions.noSpaceAfterPrefix) {
        prefix += ' ';
      }
    }
    const prefixLength = prefix.length;
    const textColor = statusOptions.textColor;
    const prefixColor = statusOptions.isStatic ? statusOptions.prefixColor : statusOptions.spinnerColor;

    text = breakText(text, prefixLength, indent);
    text = indentText(text, prefixLength, indent);
    line = `${prefixLength ? chalk[prefixColor](prefix) : ''}${textColor ? chalk[textColor](text) : text}`;

    const linesLength = getLinesLength(text, prefixLength, indent);
    const output = `${secondStageIndent(line, indent)}${EOL}`;
    return { output, linesLength };
  }

  addLog(log) {
    this.logs.push(log);
  }

  getStatus(name) {
    const override = this.statusOverrides[this.statusRegistry.actualName(name)] || {};
    return { ...this.statusRegistry.getStatus(name), ...override };
  }

  setSpinnerProperties(options, status) {
    this.applyStatusOverrides(options);
    options = purgeSpinnerOptions(options);
    status = status || this.options.status || 'spinning';

    this.options = { ...this.options, ...options, status };
    return this;
  }

  updateSpinnerState() {
    this.emit('updateSpinnerState');
  }
}

class Spinnies {
  constructor(options = {}) {
    options = purgeSpinnersOptions(options);
    this.options = {
      color: 'white',
      spinnerColor: 'greenBright',
      succeedColor: 'green',
      failColor: 'red',
      spinner: terminalSupportsUnicode() ? dots : dashes,
      disableSpins: false,
      ...options
    };

    this.logs = [];
    this.spinners = {};
    this.statusRegistry = new StatusRegistry(DEFAULT_STATUS);

    this.isCursorHidden = false;
    this.currentInterval = null;
    this.stream = process.stderr;
    this.lineCount = 0;
    this.currentFrameIndex = 0;
    this.spin = !this.options.disableSpins && !process.env.CI && process.stderr && process.stderr.isTTY;

    this.statusRegistry.configureStatus('spinning', {
      aliases: ['spin', 'active', 'default'],
      spinnerColor: this.options.color,
      textColor: this.options.color,
      prefix: '-',
      prefixColor: this.options.color
    });
    this.statusRegistry.configureStatus('success', {
      aliases: ['succeed', 'done'],
      prefix: this.options.succeedPrefix,
      isStatic: true,
      noSpaceAfterPrefix: false,
      prefixColor: this.options.succeedColor,
      textColor: this.options.succeedColor
    });
    this.statusRegistry.configureStatus('fail', {
      aliases: ['failed', 'error'],
      prefix: this.options.failPrefix,
      isStatic: true,
      noSpaceAfterPrefix: false,
      prefixColor: this.options.failColor,
      textColor: this.options.failColor
    });
    this.statusRegistry.configureStatus('non-spinnable', {
      aliases: ['static', 'inactive'],
      prefix: false,
      isStatic: true
    });
    this.statusRegistry.configureStatus('stopped', {
      aliases: ['stop', 'cancel'],
      prefix: false,
      isStatic: true,
      textColor: 'gray'
    });

    ['update', 'status', 'succeed', 'fail', 'setSpinnerProperties'].forEach(method => {
      this.aliasChildMethod(method);
    });

    this.bindExitEvent();
  }

  addLog(str) {
    this.logs.push(str);
  }

  get(name) {
    if (typeof name !== 'string') throw new Error('A spinner reference name must be specified');
    if (!this.spinners[name]) throw new Error(`No spinner initialized with name ${name}`);
    return this.spinners[name];
  }

  pick(name) {
    return this.get(name).options;
  }

  setFrames(frames) {
    const spinner = turnToValidSpinner(frames);
    this.options.spinner = spinner;
    this.currentFrameIndex = 0;
    this.updateSpinnerState();

    return this;
  }

  add(name, options = {}) {
    if (typeof name !== 'string') throw new Error('A spinner reference name must be specified');
    if (this.spinners[name] !== undefined) throw new Error(`A spinner named '${name}' already exists`);

    const spinnie = new Spinnie({ name, options, inheritedOptions: this.options, statusRegistry: this.statusRegistry, logs: this.logs });

    spinnie.on('removeMe', () => {
      this.remove(name);
    }).on('updateSpinnerState', () => {
      this.updateSpinnerState();
    });

    this.spinners[name] = spinnie;

    this.updateSpinnerState();

    return spinnie;
  }

  remove(name) {
    if (typeof name !== 'string') throw new Error('A spinner reference name must be specified');
    if (!this.get(name)) throw new Error(`No spinner initialized with name ${name}`);

    this.get(name).removeAllListeners();
    delete this.spinners[name];
    this.updateSpinnerState();
  }

  stopAll(newStatus = 'stopped') {
    if (this.statusRegistry.actualName(newStatus) === undefined) newStatus = 'stopped';
    Object.keys(this.spinners).forEach(name => {
      const currentSpinner = this.get(name);
      const currentStatus = currentSpinner.getStatus(currentSpinner.options.status);
      if (!currentStatus.isStatic) {
        currentSpinner.options.status = newStatus;
      }
    });
    this.checkIfActiveSpinners();

    return this.spinners;
  }

  hasActiveSpinners() {
    return !!Object.values(this.spinners).find((spinner) => spinner.isActive());
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
      .keys(this.spinners)
      .forEach((name) => {
        const renderedSpinner = this.get(name).render(frame);

        linesLength.push(...renderedSpinner.linesLength);
        output += renderedSpinner.output;
      });

    if (!hasActiveSpinners) readline.clearScreenDown(this.stream);
    writeStream(this.stream, output, linesLength);
    if (hasActiveSpinners) cleanStream(this.stream, linesLength);
    this.lineCount = linesLength.length;
  }

  setRawStreamOutput() {
    Object.keys(this.spinners).forEach(name => {
      const spinner = this.get(name);
      process.stderr.write(spinner.rawRender() + EOL);
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
      this.removeExitListener();
    }
  }

  aliasChildMethod(method) {
    if (this[method] !== undefined) return;

    this[method] = (name, ...args) => {
      const spinner = this.get(name);
      return spinner[method](...args);
    };
  }

  bindExitEvent() {
    this.removeExitListener = onExit(() => {
      // cli-cursor will automatically show the cursor...
      readline.moveCursor(process.stderr, 0, this.lineCount);
    }, { alwaysLast: true });
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
module.exports.StatusRegistry = StatusRegistry;
