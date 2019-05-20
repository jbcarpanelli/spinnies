'use strict';

const expect = require('chai').expect

const { purgeSpinnersOptions, purgeSpinnerOptions, colorOptions } = require('../utils');

describe('utils', () => {
  beforeEach('set options', () => {
    this.colors = { color: 'blue', spinnerColor: 'blue', successColor: 'blue', failColor: 'blue' };
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
          const colors = colorOptions({ ...this.colors, spinnerColor: 'foo', successColor: 'bar' });
          expect(colors).to.include({ color: 'blue', failColor: 'blue' });
          expect(colors).to.not.have.any.keys('spinnerColor', 'successColor');
        });
      });
    });

    describe('#purgeSpinnersOptions', () => {
      describe('spinner object', () => {
        context('when providing invalid interval and frames', () => {
          it('does not persist the spinner', () => {
            const spinner = { interval: 'foo', frames: 'bar' };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.include(this.colors);
            expect(options).to.not.have.property('spinner');
          });
        });

        context('when providing invalid interval', () => {
          it('does not persist the spinner', () => {
            const spinner = { interval: 'foo', frames: ['-', '+'] };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.include(this.colors);
            expect(options).to.not.have.property('spinner');
          });
        });

        context('when providing invalid frames', () => {
          it('does not persist the spinner', () => {
            const spinner = { interval: 100, frames: 'foo' };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.include(this.colors);
            expect(options).to.not.have.property('spinner');
          });
        });

        context('when providing valid spinner', () => {
          it('persists the spinner', () => {
            const spinner = { interval: 100, frames: ['-', '+'] };
            const options = purgeSpinnersOptions({ ...this.colors, spinner });
            expect(options).to.include({ ...this.colors, spinner });
          });
        })
      });
    });

    describe('#purgeSpinnerOptions', () => {
      context('when providing valid status and name', () => {
        it('persist them', () => {
          const options = purgeSpinnerOptions({ ...this.colors, text: 'text', status: 'success' });
          expect(options).to.include({ ...this.colors, text: 'text', status: 'success' });
        });
      });

      context('when providing invalid status and name', () => {
        it('does not persist them', () => {
          const options = purgeSpinnerOptions({ ...this.colors, text: 3, status: 'foo' });
          expect(options).to.include(this.colors);
          expect(options).to.not.have.any.keys('text', 'status');
        });
      });
    });
  });
});
