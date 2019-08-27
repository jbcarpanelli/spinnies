'use strict';

const expect = require('chai').expect

const EOL = require('os').EOL;
const { statusOptionsFromNormalUpdate, purgeStatusOptions, purgeSpinnersOptions, purgeSpinnerOptions, colorOptions, breakText, terminalSupportsUnicode } = require('../utils');
const { dots, dashes } = require('../spinners');
const platformSpinner = terminalSupportsUnicode() ? dots : dashes;

describe('utils', () => {
  beforeEach('set options', () => {
    this.colors = { color: 'blue', spinnerColor: 'blue', succeedColor: 'blue', failColor: 'blue' };
  });

  describe('functions', () => {
    describe('#colorOptions', () => {
      context('when specifying other attributes rather than valid colors', () => {
        it('removes the invalid keys', () => {
          const colors = colorOptions({ ...this.colors, foo: 'foo', bar: 'bar' });
          expect(colors).to.include(this.colors);
          expect(colors).to.not.include({ foo: 'foo', bar: 'bar' });
          expect(colors).to.not.have.any.keys('foo', 'bar');
        });

        it('removes invalid colors', () => {
          const colors = colorOptions({ ...this.colors, spinnerColor: 'foo', succeedColor: 'bar' });
          expect(colors).to.include({ color: 'blue', failColor: 'blue' });
          expect(colors).to.not.have.any.keys('spinnerColor', 'succeedColor');
        });
      });
    });

    describe('#purgeSpinnersOptions', () => {
      describe('spinner object', () => {
        context('when providing invalid interval and frames', () => {
          it('picks the default spinner', () => {
            const spinner = { interval: 'foo', frames: 'bar' };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.deep.include({ ...this.colors, spinner: platformSpinner });
          });
        });

        context('when providing invalid interval', () => {
          it('picks the interval from the default spinner', () => {
            const spinner = { interval: 'foo', frames: ['-', '+'] };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.deep.include({ ...this.colors, spinner: { interval: platformSpinner.interval, frames: ['-', '+'] } });
          });
        });

        context('when providing invalid frames', () => {
          it('picks frames from the default spinner', () => {
            const spinner = { interval: 100, frames: 'foo' };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.deep.include({ ...this.colors, spinner: { interval: 100, frames: platformSpinner.frames } });
          });
        });

        context('when providing valid spinner', () => {
          it('persists the spinner', () => {
            const spinner = { interval: 100, frames: ['-', '+'] };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.deep.include({ ...this.colors, spinner });
          });
        })

        context('when providing invalid spinner name from `cli-spinners`', () => {
          it('picks the default spinner', () => {
            const spinner = 'i-dont-exist';
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.deep.include({ ...this.colors, spinner: platformSpinner });
          });
        });

        context('when providing a valid spinner name from `cli-spinners`', () => {
          it('picks that spinner from the `cli-spinners` library', () => {
            const spinner = 'dots3';
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.deep.include({ ...this.colors, spinner: require('cli-spinners')[spinner] });
          });
        });
      });
    });

    describe('#purgeSpinnerOptions', () => {
      context('when providing valid name', () => {
        it('persist them', () => {
          const options = purgeSpinnerOptions({ ...this.colors, text: 'text', status: 'succeed' });
          expect(options).to.include({ ...this.colors, text: 'text', status: 'succeed' });
        });
      });

      context('when providing invalid name', () => {
        it('does not persist them', () => {
          const options = purgeSpinnerOptions({ ...this.colors, text: 3 });
          expect(options).to.include(this.colors);
          expect(options).to.not.have.any.keys('text');
        });
      });
    });

    describe('#purgeStatusOptions', () => {
      context('prefix', () => {
        context('when it\'s a number', () => {
          it('keeps it', () => {
            const status = { prefix: 111 };
            const options = purgeStatusOptions(status);
            expect(options).to.have.property('prefix');
          });
        });

        context('when it\'s a string', () => {
          it('keeps it', () => {
            const status = { prefix: '*' };
            const options = purgeStatusOptions(status);
            expect(options).to.have.property('prefix');
          });
        });

        context('when it\'s false', () => {
          it('keeps it', () => {
            const status = { prefix: false };
            const options = purgeStatusOptions(status);
            expect(options).to.have.property('prefix');
          });
        });

        context('when it\'s an object', () => {
          it('removes it', () => {
            const status = { prefix: {} };
            const options = purgeStatusOptions(status);
            expect(options).to.not.have.property('prefix');
          });
        });

        context('when it\'s true', () => {
          it('removes it', () => {
            const status = { prefix: true };
            const options = purgeStatusOptions(status);
            expect(options).to.not.have.property('prefix');
          });
        });
      });

      it('removes invalid colors', () => {
        const colors = purgeStatusOptions({ textColor: 'foo', prefixColor: 'bar', spinnerColor: 'blue' });
        expect(colors).to.include({ spinnerColor: 'blue' });
        expect(colors).to.not.have.any.keys('textColor', 'prefixColor');
      });
    });

    describe('#statusOptionsFromNormalUpdate', () => {
      it('reports what to update and provide options', () => {
        const res = statusOptionsFromNormalUpdate({ ...this.colors, text: 'text', status: 'succeed' });
        expect(res).to.deep.equal({
          shouldSetDefault: true,
          shouldSetFail: true,
          shouldSetSucceed: true,
          defaultSet: { textColor: 'blue', spinnerColor: 'blue', prefixColor: 'blue' },
          failSet: { prefixColor: 'blue', textColor: 'blue' },
          succeedSet: { prefixColor: 'blue', textColor: 'blue' }
        });
      });
    });

    describe('#breakText', () => {
      beforeEach(() => {
        this.columns = process.stderr.columns;
        process.stderr.columns = 15;
      });

      afterEach(() => {
        process.stderr.columns = this.columns;
      });

      context('when number of lines in text is greater than the columns length', () => {
        context('without indent', () => {
          it('adds line-breaks to the given text', () => {
            const text = breakText('im a very long sentence yay yay yay yay', 3);
            const splitted = text.split(EOL);
            expect(splitted).to.have.lengthOf(5);
            expect(splitted[0]).to.equal('im a very');
            expect(splitted[1]).to.equal('long');
            expect(splitted[2]).to.equal('sentence');
            expect(splitted[3]).to.equal('yay yay yay');
            expect(splitted[4]).to.equal('yay');
          });
        });

        context('with indent', () => {
          it('adds line-breaks to the given text taking indent into consideration', () => {
            const text = breakText('im a very long sentence yay yay yay yay', 3, 4);
            const splitted = text.split(EOL);
            expect(splitted).to.have.lengthOf(7);
            expect(splitted[0]).to.equal('im a');
            expect(splitted[1]).to.equal('very');
            expect(splitted[2]).to.equal('long');
            expect(splitted[3]).to.equal('sentence');
          });
        });
      });

      context('when number of lines in text is less than the columns length', () => {
        it('does not add line-breaks to the given text', () => {
          const text = '12345';
          expect(text.split(EOL)).to.have.lengthOf(1);
        });
      });
    });
  });
});
