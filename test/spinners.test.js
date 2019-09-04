'use strict';

const expect = require('chai').expect
const sinon = require('sinon');
const { Observable } = require('rxjs');

const Spinnies = require('..');
const { expectToBehaveLikeAnUpdate, expectToBehaveLikeAStatusChange } = require('./behaviours.test');

const _setTimeout = setTimeout;

setInterval = (fn) => fn();
setTimeout = (fn) => fn();
process.stderr.write = () => {};

describe('Spinnies', () => {
  beforeEach('initialize', () => {
    this.spinners = new Spinnies({
      spinner: { interval: 130, frames: ['O', 'o', '.', 'o', 'O'] }
    });
    this.spinnersOptions = {
      succeedColor: 'green',
      failColor: 'red',
      spinnerColor: 'greenBright',
      status: 'spinning'
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
              const options = { color: 'foo', spinnerColor: 'bar' };
              const spinner = this.spinners.add('spinner-name', options);
              expect(spinner.options).to.include(this.spinnersOptions);
            });
          });
        });
      });
    });

    describe('#remove', () => {
      describe('validations', () => {
        context('when no spinner name specified', () => {
          it('throws an error', () => {
            expect(() => this.spinners.remove()).to.throw('A spinner reference name must be specified');
          });
        });

        context('when a spinner with that name does not exist', () => {
          it('throws an error', () => {
            expect(() => this.spinners.remove(`im-an-illusion`)).to.throw('No spinner initialized with name im-an-illusion');
          });
        });
      });

      describe('removing a spinner', () => {
        context('when using the spinnies instance', () => {
          it('deletes it from the spinners object', () => {
            this.spinners.add('spinner');
            expect(this.spinners.get('spinner')).to.not.be.undefined;
            this.spinners.remove('spinner');
            expect(() => this.spinners.get('spinner')).to.throw('No spinner initialized with name spinner');
          });

          it('stops listening to events from that spinner', () => {
            const calls = () => this.spinners.updateSpinnerState.callCount;

            sinon.spy(this.spinners, 'updateSpinnerState');
            expect(calls()).to.be.equal(0); // not called yet

            const spinner = this.spinners.add('spinner');
            expect(calls()).to.be.equal(1); // updated once when we added that spinner

            spinner.update();
            expect(calls()).to.be.equal(2); // updated again when we 'updated' that spinner

            this.spinners.remove('spinner');
            expect(calls()).to.be.equal(3); // updated again when we removed that spinner

            spinner.update();
            expect(calls()).to.be.equal(3); // not reacting to the updates since the spinner was deleted...
          });
        });

        context('when using the spinner instance', () => {
          it('deletes it from the spinners object', () => {
            const spinner = this.spinners.add('spinner');
            expect(this.spinners.get('spinner')).to.not.be.undefined;
            spinner.remove('spinner');
            expect(() => this.spinners.get('spinner')).to.throw('No spinner initialized with name spinner');
          });

          it('stops listening to events from that spinner', () => {
            const calls = () => this.spinners.updateSpinnerState.callCount;

            sinon.spy(this.spinners, 'updateSpinnerState');
            expect(calls()).to.be.equal(0); // not called yet

            const spinner = this.spinners.add('spinner');
            expect(calls()).to.be.equal(1); // updated once when we added that spinner

            spinner.update();
            expect(calls()).to.be.equal(2); // updated again when we 'updated' that spinner

            spinner.remove();
            expect(calls()).to.be.equal(3); // updated again when we removed that spinner

            spinner.update();
            expect(calls()).to.be.equal(3); // not reacting to the updates since the spinner was deleted...
          });
        });
      });
    });

    describe('#hidden', () => {
      context('when passing invalid value', () => {
        it('ignores it', () => {
          const spinner = this.spinners.add('some-spinner');
          expect(spinner.options.hidden).to.be.false;
          expect(spinner.hidden('a string')).to.be.false;
          expect(spinner.options.hidden).to.be.false;
        });
      });

      context('when passing true', () => {
        it('sets the hidden option to true', () => {
          const spinner = this.spinners.add('some-spinner');
          expect(spinner.options.hidden).to.be.false;
          expect(spinner.hidden(true)).to.be.true;
          expect(spinner.options.hidden).to.be.true;
        });
      });

      context('when passing false', () => {
        it('sets the hidden option to false', () => {
          const spinner = this.spinners.add('some-spinner');
          expect(spinner.options.hidden).to.be.false;
          spinner.options.hidden = 111;
          expect(spinner.hidden(false)).to.be.false;
          expect(spinner.options.hidden).to.be.false;
        });
      });
    });

    describe('#hide', () => {
      it('sets the hidden option to true', () => {
        const spinner = this.spinners.add('some-spinner');
        expect(spinner.hidden()).to.be.false;
        expect(spinner.hide()).to.be.true;
        expect(spinner.hidden()).to.be.true;
      });
    });

    describe('#show', () => {
      it('sets the hidden option to false', () => {
        const spinner = this.spinners.add('some-spinner');
        expect(spinner.hide()).to.be.true;
        expect(spinner.show()).to.be.false;
        expect(spinner.hidden()).to.be.false;
      });
    });

    describe('#bind', () => {
      beforeEach('add spinner', () => {
        this.spinner = this.spinners.add('spinner');
      });

      context('when task is an observable', () => {
        context('when the observable calls next', () => {
          context('when it calls next with a string', () => {
            it('updates the spinner text', (done) => {
              expect(this.spinner.options.text).to.equal('spinner');
              this.spinner.bind(new Observable(subscriber => {
                subscriber.next('Updated text');
              }));
              _setTimeout(() => {
                expect(this.spinner.options.text).to.equal('Updated text');
                done();
              }, 1);
            });
          });

          context('when it calls next with an invalid argument', () => {
            it('doesn\'t modify the text', (done) => {
              expect(this.spinner.options.text).to.equal('spinner');
              this.spinner.bind(new Observable(subscriber => {
                subscriber.next(10);
              }));
              _setTimeout(() => {
                expect(this.spinner.options.text).to.equal('spinner');
                done();
              }, 1);
            });
          });
        });

        context('when the observable calls complete', () => {
          it('succeed the spinner', (done) => {
            expect(this.spinner.options.status).to.equal('spinning');
            this.spinner.bind(new Observable(subscriber => {
              subscriber.complete();
            }));
            _setTimeout(() => {
              expect(this.spinner.options.status).to.equal('success');
              done();
            }, 1);
          });
        });

        context('when the observable calls error', () => {
          context('when it calls error with no arguments', () => {
            it('fails the spinner', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(new Observable(subscriber => {
                subscriber.error();
              }));
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('fail');
                done();
              }, 1);
            });
          });

          context('when it calls error with a string', () => {
            it('fails the spinner and changes the text to that string', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(new Observable(subscriber => {
                subscriber.error('I failed :(');
              }));
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('fail');
                expect(this.spinner.options.text).to.equal('I failed :(');
                done();
              }, 1);
            });
          });

          context('when it calls error with an invalid argument', () => {
            it('fails the spinner without changing the text', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(new Observable(subscriber => {
                subscriber.error([]);
              }));
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('fail');
                expect(this.spinner.options.text).to.equal('spinner');
                done();
              }, 1);
            });
          });
        });
      });

      context('when task is a promise', () => {
        context('when the promise resolves', () => {
          context('when it resolves with no arguments', () => {
            it('succeed the spinner', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(Promise.resolve());
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('success');
                done();
              }, 1);
            });
          });

          context('when it resolves with a string', () => {
            it('succeed the spinner and changes the text to that string', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(Promise.resolve('Success :D'));
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('success');
                expect(this.spinner.options.text).to.equal('Success :D');
                done();
              }, 1);
            });
          });

          context('when it resolves with an invalid argument', () => {
            it('succeed the spinner without changing the text', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(Promise.resolve([]));
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('success');
                expect(this.spinner.options.text).to.equal('spinner');
                done();
              }, 1);
            });
          });
        });

        context('when the promise rejects', () => {
          context('when it rejects with no arguments', () => {
            it('fails the spinner', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(Promise.reject());
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('fail');
                done();
              }, 1);
            });
          });

          context('when it rejects with a string', () => {
            it('fails the spinner and changes the text to that string', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(Promise.reject('I failed :('));
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('fail');
                expect(this.spinner.options.text).to.equal('I failed :(');
                done();
              }, 1);
            });
          });

          context('when it rejects with an invalid argument', () => {
            it('fails the spinner without changing the text', (done) => {
              expect(this.spinner.options.status).to.equal('spinning');
              this.spinner.bind(Promise.reject([]));
              _setTimeout(() => {
                expect(this.spinner.options.status).to.equal('fail');
                expect(this.spinner.options.text).to.equal('spinner');
                done();
              }, 1);
            });
          });
        });
      });
    });

    describe('#setFrames', () => {
      describe('setting frames', () => {
        it('sets the options.spinner property on the spinnies instance', () => {
          expect(this.spinners.options.spinner).to.have.keys({
            interval: 130,
            frames: ['O', 'o', '.', 'o', 'O']
          });

          this.spinners.setFrames({
            interval: 50,
            frames: ['a', 'b', 'c']
          });

          expect(this.spinners.options.spinner).to.have.keys({
            interval: 50,
            frames: ['a', 'b', 'c']
          });
        });

        it('sets the resets the currentFrameIndex property on the spinnies instance', () => {
          expect(this.spinners.options.spinner).to.have.keys({
            interval: 130,
            frames: ['O', 'o', '.', 'o', 'O']
          });

          this.spinners.currentFrameIndex = 9;

          this.spinners.setFrames({
            interval: 50,
            frames: ['a', 'b', 'c']
          });

          expect(this.spinners.currentFrameIndex).to.equal(1);
        });
      });
    });

    describe(`#text`, () => {
      beforeEach('add spinner', () => {
        this.spinner = this.spinners.add('spinner');
        this.text = () => this.spinner.options.text;
      });

      it(`changes the text property on the spinner's options`, () => {
        expect(this.text()).to.equal('spinner');
        this.spinner.text('Another string');
        expect(this.text()).to.equal('Another string');
      });

      context('with spinner instance', () => {
        it(`changes the text property on the spinner's options`, () => {
          expect(this.text()).to.equal('spinner');
          this.spinners.text('spinner', 'Another string');
          expect(this.text()).to.equal('Another string');
        });
      });

      context('when text is invalid', () => {
        it(`doesn't change the text property`, () => {
          expect(this.text()).to.equal('spinner');
          this.spinners.text('spinner', 9);
          expect(this.text()).to.equal('spinner');
        });
      });

      context('when not specifying a spinner name', () => {
        it('throws an error', () => {
            expect(() => this.spinners.text({})).to.throw('A spinner reference name must be specified');
        });
      });

      context('when specifying a non-existent spinner name', () => {
        it('throws an error', () => {
          expect(() => this.spinners.text('i-dont-exist')).to.throw('No spinner initialized with name i-dont-exist')
        });
      });
    });

    describe(`#indent`, () => {
      beforeEach('add spinner', () => {
        this.spinner = this.spinners.add('spinner', { indent: 2 });
        this.indent = () => this.spinner.options.indent;
      });

      it(`changes the indent property on the spinner's options`, () => {
        expect(this.indent()).to.equal(2);
        this.spinner.indent(4);
        expect(this.indent()).to.equal(4);
      });

      context('with spinner instance', () => {
        it(`changes the indent property on the spinner's options`, () => {
          expect(this.indent()).to.equal(2);
          this.spinners.indent('spinner', 4);
          expect(this.indent()).to.equal(4);
        });
      });

      context('when indent is invalid', () => {
        it(`doesn't change the indent property`, () => {
          expect(this.indent()).to.equal(2);
          this.spinner.indent('a string');
          expect(this.indent()).to.equal(2);
        });
      });

      context('when not specifying a spinner name', () => {
        it('throws an error', () => {
            expect(() => this.spinners.indent({})).to.throw('A spinner reference name must be specified');
        });
      });

      context('when specifying a non-existent spinner name', () => {
        it('throws an error', () => {
          expect(() => this.spinners.indent('i-dont-exist')).to.throw('No spinner initialized with name i-dont-exist')
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
        expectToBehaveLikeAStatusChange(this, 'warning');
        expectToBehaveLikeAStatusChange(this, 'information');
        expectToBehaveLikeAStatusChange(this, 'default');
      });

      expectToBehaveLikeAnUpdate(this, 'succeed');
      expectToBehaveLikeAnUpdate(this, 'fail');
      expectToBehaveLikeAnUpdate(this, 'info');
      expectToBehaveLikeAnUpdate(this, 'warn');
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
          });

          it('sets non-finished spinners as fail', () => {
            this.spinners.stopAll('fail');

            expectToKeepFinishedSpinners();
            expect(this.thirdSpinner.options.status).to.eq('fail');
          });

          it('sets non-finished spinners as stopped', () => {
            this.spinners.stopAll('foobar');

            expectToKeepFinishedSpinners();
            expect(this.thirdSpinner.options.status).to.eq('stopped');
          });
        });

        context('when not providing a new status', () => {
          it('sets non-finished spinners as stopped', () => {
            this.spinners.stopAll();

            expectToKeepFinishedSpinners();
            expect(this.thirdSpinner.options.status).to.eq('stopped');
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

      describe('statusOverrides', () => {
        it('keeps previous overrides', () => {
          const spinner = this.spinners.get('spinner');
          expect(spinner.getStatus('fail')).to.include({
            prefix: spinner.options.failPrefix,
            isStatic: true,
            noSpaceAfterPrefix: false,
            prefixColor: spinner.options.failColor,
            textColor: spinner.options.failColor
          });

          spinner.update({
            failColor: 'redBright',
          });

          expect(spinner.getStatus('fail')).to.include({
            prefixColor: 'redBright',
            textColor: 'redBright'
          });

          spinner.update({
            failPrefix: 'x',
          });

          // it keeps previous overrides...
          expect(spinner.getStatus('fail')).to.include({
            prefixColor: 'redBright',
            textColor: 'redBright',
            prefix: 'x'
          });
        });
      });

      context('when specifying options that should override status to update', () => {
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
            spinnerColor: spinner.options.spinnerColor,
            textColor: spinner.options.color,
          });

          spinner.update({
            color: 'magenta',
            failColor: 'redBright',
            failPrefix: 'bad',
            succeedPrefix: 'V',
            succeedColor: 'cyan',
            infoColor: 'cyan',
            infoPrefix: 'Ii',
            warnColor: 'cyan',
            warnPrefix: 'WARN'
          });

          // use different names/aliases to make sure everything updates
          expect(spinner.getStatus('failed')).to.include({
            prefixColor: 'redBright',
            textColor: 'redBright',
            prefix: 'bad'
          });
          expect(spinner.getStatus('done')).to.include({
            prefix: 'V',
            prefixColor: 'cyan',
            textColor: 'cyan'
          });
          expect(spinner.getStatus('info')).to.include({
            prefixColor: 'cyan',
            textColor: 'cyan',
            prefix: 'Ii'
          });
          expect(spinner.getStatus('warn')).to.include({
            prefixColor: 'cyan',
            textColor: 'cyan',
            prefix: 'WARN'
          });
          expect(spinner.getStatus('default')).to.include({
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
