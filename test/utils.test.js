'use strict';

const expect = require('chai').expect

const EOL = require('os').EOL;
const { statusOptionsFromNormalUpdate, purgeStatusOptions, purgeSpinnersOptions, purgeSpinnerOptions, colorOptions, breakText, terminalSupportsUnicode } = require('../utils');
const { dots, dashes } = require('../spinners');
const platformSpinner = terminalSupportsUnicode() ? dots : dashes;

describe('utils', () => {
  beforeEach('set options', () => {
    this.colors = { color: 'blue', spinnerColor: 'blue', succeedColor: 'blue', failColor: 'blue', warnColor: 'blue', infoColor: 'cyan' };
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
      context('when providing valid name, status, indent and hidden', () => {
        it('persist them', () => {
          const options = purgeSpinnerOptions({ ...this.colors, text: 'text', status: 'some-status', indent: 9, hidden: true });
          expect(options).to.include({ ...this.colors, text: 'text', status: 'some-status', indent: 9, hidden: true });
        });
      });

      context('when providing invalid name, status, indent and hidden', () => {
        it('does not persist them', () => {
          const options = purgeSpinnerOptions({ ...this.colors, text: true, status: 555, indent: [], hidden: 'string' });
          expect(options).to.include(this.colors);
          expect(options).to.not.have.any.keys(['text', 'status', 'indent', 'hidden']);
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

      describe('isStatic', () => {
        context('when it\'s true', () => {
          it('keeps it', () => {
            const status = { isStatic: true };
            const options = purgeStatusOptions(status);
            expect(options).to.have.property('isStatic');
          });
        });

        context('when it\'s false', () => {
          it('keeps it', () => {
            const status = { isStatic: false };
            const options = purgeStatusOptions(status);
            expect(options).to.have.property('isStatic');
          });
        });

        context('when it\'s a number', () => {
          it('removes it', () => {
            const status = { isStatic: 99 };
            const options = purgeStatusOptions(status);
            expect(options).to.not.have.property('isStatic');
          });
        });
      });

      describe('noSpaceAfterPrefix', () => {
        context('when it\'s true', () => {
          it('keeps it', () => {
            const status = { noSpaceAfterPrefix: true };
            const options = purgeStatusOptions(status);
            expect(options).to.have.property('noSpaceAfterPrefix');
          });
        });

        context('when it\'s false', () => {
          it('keeps it', () => {
            const status = { noSpaceAfterPrefix: false };
            const options = purgeStatusOptions(status);
            expect(options).to.have.property('noSpaceAfterPrefix');
          });
        });

        context('when it\'s a number', () => {
          it('removes it', () => {
            const status = { noSpaceAfterPrefix: 99 };
            const options = purgeStatusOptions(status);
            expect(options).to.not.have.property('noSpaceAfterPrefix');
          });
        });
      });

      it('removes invalid colors', () => {
        const colors = purgeStatusOptions({ textColor: 'foo', prefixColor: 'bar', spinnerColor: 'blue' });
        expect(colors).to.include({ spinnerColor: 'blue' });
        expect(colors).to.not.have.any.keys('textColor', 'prefixColor');
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
            const text = breakText('im a very long sentence yay yay yay yay', 3, null, process.stderr);
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
            const text = breakText('im a very long sentence yay yay yay yay', 3, 4, process.stderr);
            const splitted = text.split(EOL);
            expect(splitted).to.have.lengthOf(7);
          });
        });

        context('when trying to break a really long word', () => {
          it('force breaks the word', () => {
            const text = breakText('imaverylongwordyesiam', 3, null, process.stderr);
            const splitted = text.split(EOL);
            expect(splitted).to.have.lengthOf(2);
            expect(splitted[0]).to.equal('imaverylong');
            expect(splitted[1]).to.equal('wordyesiam');
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
