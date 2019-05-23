'use strict';

const expect = require('chai').expect

const Spinners = require('..');
const { expectToBehaveLikeAnUpdate } = require('./behaviours.test');

setInterval = (fn) => fn();
setTimeout = (fn) => fn();

// TODO: test  stderr
// silence stderr writes for now.
process.stderr.write = () => null;

describe('MultiSpinner', () => {
  beforeEach('initialize', () => {
    this.spinners = new Spinners();
    this.spinnersOptions = {
      color: 'white',
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
          expect(spinner).to.include(this.spinnersOptions);
        });

        context('when no initial text is specified', () => {
          it('takes the spinner name as text', () => {
            const spinner = this.spinners.add('spinner-name');
            expect(spinner.text).to.eq('spinner-name');
          });
        });

        context('when initial text is specified', () => {
          it('uses the specified spinner text', () => {
            const spinner = this.spinners.add('spinner-name', { text: 'Hello spinner-name' });
            expect(spinner.text).to.eq('Hello spinner-name');
          });
        });

        context('when specifying options', () => {
          context('when options are correct', () => {
            it('overrides the default options', () => {
              const options = { color: 'black', spinnerColor: 'black', succeedColor: 'black', failColor: 'black', status: 'non-spinnable' };
              const spinner = this.spinners.add('spinner-name', options);
              expect(spinner).to.include({ ...this.spinnersOptions, ...options, status: 'non-spinnable' });
            });
          });

          context('when options are not valid', () => {
            it('mantains the default options', () => {
              const options = { color: 'foo', spinnerColor: 'bar', status: 'buz' };
              const spinner = this.spinners.add('spinner-name', options);
              expect(spinner).to.include(this.spinnersOptions);
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

      expectToBehaveLikeAnUpdate(this, 'succeed');
      expectToBehaveLikeAnUpdate(this, 'fail');
      expectToBehaveLikeAnUpdate(this, 'update');

      describe('#stopAll', () => {
        it('sets non-finished spinners as stopped', () => {
          const spinner = this.spinners.succeed('spinner');
          const anotherSpinner = this.spinners.fail('another-spinner');
          const nonSpinnable = this.spinners.pick('non-spinnable');
          const thirdSpinner = this.spinners.pick('third-spinner');
          this.spinners.stopAll();

          expect(spinner.status).to.eq('succeed');
          expect(anotherSpinner.status).to.eq('fail');
          expect(nonSpinnable.status).to.eq('non-spinnable');
          expect(thirdSpinner.status).to.eq('stopped');
          expect(thirdSpinner.color).to.eq('grey');
        });
      });
    });
  });
});
