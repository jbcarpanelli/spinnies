'use strict';

const readline = require('readline');

const MultiSpinner = {
  initialize(options = {}) {
    this.options = options;
    this.spinners = [];
    this.index = 0;
    this.currentInterval = null;
  },

  add(text, options = {}) {
    this.spinners.push({
      text,
      status: 'spinning',
      ...options,
      index: this.index,
    });
    this.index += 1;
    this.setSpinner();
    return { index: this.index - 1, spinners: this.spinners };
  },

  setSpinner() {
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
    this.spinners.map(({ text, status }) => {
      if (status === 'spinning') {
        line = `${frame} ${text}`;
      } else if (status === 'success') {
        line = `✓ ${text}`;
      } else if (status === 'fail') {
        line = `✖ ${text}`;
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

module.exports = MultiSpinner;
