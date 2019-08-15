'use strict';

const expect = require('chai').expect

const Spinnies = require('..');
const { expectToBehaveLikeAnUpdate, expectToBehaveLikeAStatusChange } = require('./behaviours.test');

setInterval = (fn) => fn();
setTimeout = (fn) => fn();
process.stderr.write = () => {};

describe('Spinnies', () => {
  beforeEach('initialize', () => {
    this.spinners = new Spinnies();
    this.spinnersOptions = {
      succeedColor: 'green',
      failColor: 'red',
      spinnerColor: 'greenBright',
      status: 'spinning',
    };
  });

  describe('methods', () => {
    describe('#add', () => {
      describe('validations', () => {
        context('when no spinner name specified', () => {
          it('throws an error', () => {
            expect(() => this.spinners.add()).to.throw('A spinner reference name must be specified');
          });
        });
      });

      describe('adding new spinners', () => {
        it('has initial variables defined', () => {
          const spinner = this.spinners.add('spinner');
          expect(spinner.options).to.include(this.spinnersOptions);
        });

        context('when no initial text is specified', () => {
          it('takes the spinner name as text', () => {
            const spinner = this.spinners.add('spinner-name');
            expect(spinner.options.text).to.eq('spinner-name');
          });
        });

        context('when initial text is specified', () => {
          it('uses the specified spinner text', () => {
            const spinner = this.spinners.add('spinner-name', { text: 'Hello spinner-name' });
            expect(spinner.options.text).to.eq('Hello spinner-name');
          });
        });

        context('when specifying options', () => {
          context('when options are correct', () => {
            it('overrides the default options', () => {
              const options = { color: 'black', spinnerColor: 'black', succeedColor: 'black', failColor: 'black', status: 'non-spinnable' };
              const spinner = this.spinners.add('spinner-name', options);
              expect(spinner.options).to.include({ ...this.spinnersOptions, ...options, status: 'non-spinnable' });
            });
          });

          context('when options are not valid', () => {
            it('mantains the default options', () => {
              const options = { color: 'foo', spinnerColor: 'bar', status: 'buz' };
              const spinner = this.spinners.add('spinner-name', options);
              expect(spinner.options).to.include(this.spinnersOptions);
            });
          });
        });
      });
    });

    describe('methods that modify the status of a spinner', () => {
      beforeEach('initialize some spinners', () => {
        this.spinners.add('spinner');
        this.spinners.add('another-spinner');
        this.spinners.add('third-spinner');
        this.spinners.add('non-spinnable', { status: 'non-spinnable' });
      });

      describe('#status()', () => {
        expectToBehaveLikeAStatusChange(this, 'success');
        expectToBehaveLikeAStatusChange(this, 'fail');
        expectToBehaveLikeAStatusChange(this, 'spin');
        expectToBehaveLikeAStatusChange(this, 'error');
        expectToBehaveLikeAStatusChange(this, 'default');
      });

      expectToBehaveLikeAnUpdate(this, 'succeed');
      expectToBehaveLikeAnUpdate(this, 'fail');
      expectToBehaveLikeAnUpdate(this, 'update');

      describe('#stopAll', () => {
        beforeEach(() => {
          this.spinner = this.spinners.succeed('spinner');
          this.anotherSpinner = this.spinners.fail('another-spinner');
          this.nonSpinnable = this.spinners.get('non-spinnable');
          this.thirdSpinner = this.spinners.get('third-spinner');
        });

        const expectToKeepFinishedSpinners = () => {
          expect(this.spinner.options.status).to.eq('succeed');
          expect(this.anotherSpinner.options.status).to.eq('fail');
          expect(this.nonSpinnable.options.status).to.eq('non-spinnable');
        };

        context('when providing a new status', () => {
          it('sets non-finished spinners as succeed', () => {
            this.spinners.stopAll('succeed');

            expectToKeepFinishedSpinners();
            expect(this.thirdSpinner.options.status).to.eq('succeed');
            expect(this.thirdSpinner.options.color).to.eq('green');
          });

          it('sets non-finished spinners as fail', () => {
            this.spinners.stopAll('fail');

            expectToKeepFinishedSpinners();
            expect(this.thirdSpinner.options.status).to.eq('fail');
            expect(this.thirdSpinner.options.color).to.eq('red');
          });

          it('sets non-finished spinners as stopped', () => {
            this.spinners.stopAll('foobar');

            expectToKeepFinishedSpinners();
            expect(this.thirdSpinner.options.status).to.eq('stopped');
            expect(this.thirdSpinner.options.color).to.eq('grey');
          });
        });

        context('when not providing a new status', () => {
          it('sets non-finished spinners as stopped', () => {
            this.spinners.stopAll();

            expectToKeepFinishedSpinners();
            expect(this.thirdSpinner.options.status).to.eq('stopped');
            expect(this.thirdSpinner.options.color).to.eq('grey');
          });
        });
      });
    });


    describe('#getStatus on spinner instance', () => {
      beforeEach('initialize some spinners', () => {
        this.spinners.add('spinner');
        this.spinners.add('another-spinner');
        this.spinners.add('third-spinner');
        this.spinners.add('non-spinnable', { status: 'non-spinnable' });
      });

      context('when not specifying options that should override status to update', () => {
          it('returns the status options with the override options but doesn\'t modify the status of other spinners' , () => {
            const spinner = this.spinners.get('spinner');
            const anotherSpinner = this.spinners.get('another-spinner');
            expect(spinner.getStatus('fail')).to.include({
              prefix: spinner.options.failPrefix,
              isStatic: true,
              noSpaceAfterPrefix: false,
              prefixColor: spinner.options.failColor,
              textColor: spinner.options.failColor
            });

            expect(spinner.getStatus('success')).to.include({
              prefix: spinner.options.succeedPrefix,
              isStatic: true,
              noSpaceAfterPrefix: false,
              prefixColor: spinner.options.succeedColor,
              textColor: spinner.options.succeedColor
            });

            expect(spinner.getStatus('spin')).to.include({
              spinnerColor: spinner.options.color,
              textColor: spinner.options.color,
            });

            spinner.update({
              color: 'magenta',
              failColor: 'redBright',
              succeedPrefix: 'V'
            });

            // use different names/aliases to make sure everything updates
            expect(spinner.getStatus('failed')).to.include({
              prefixColor: 'redBright',
              textColor: 'redBright'
            });
            expect(spinner.getStatus('done')).to.include({
              prefix: 'V'
            });
            expect(spinner.getStatus('default')).to.include({
              spinnerColor: 'magenta',
              textColor: 'magenta',
            });

            // other spinners stay the same
            expect(anotherSpinner.getStatus('error')).to.not.include({
              spinnerColor: 'magenta',
              textColor: 'magenta',
            });
            expect(anotherSpinner.getStatus('done')).to.not.include({
              prefix: 'V'
            });
            expect(anotherSpinner.getStatus('default')).to.not.include({
              spinnerColor: 'magenta',
              textColor: 'magenta',
            });

          });
      });
    });
  });
});
