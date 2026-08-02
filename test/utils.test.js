'use strict';

import assert from 'node:assert/strict';
import readline from 'node:readline';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
    purgeSpinnersOptions,
    purgeSpinnerOptions,
    colorOptions,
    breakText,
    getLinesLength,
    moveCursorSequence,
    writeStream,
    cleanStream,
} from '../utils.js';
import spinners from '../spinners.json' with { type: 'json' };
import { assertDeepIncludes, assertIncludes, assertLacksKeys } from './helpers.js';

const { dots } = spinners;

describe('utils', () => {
    let colors;

    beforeEach(() => {
        colors = {
            color: 'blue',
            spinnerColor: 'blue',
            succeedColor: 'blue',
            failColor: 'blue',
        };
    });

    describe('functions', () => {
        describe('#colorOptions', () => {
            describe('when specifying other attributes rather than valid colors', () => {
                it('removes the invalid keys', () => {
                    const result = colorOptions({ ...colors, foo: 'foo', bar: 'bar' });

                    assertIncludes(result, colors);
                    assertLacksKeys(result, 'foo', 'bar');
                });

                it('replace with default if invalid colors', () => {
                    const result = colorOptions({
                        ...colors,
                        spinnerColor: 'foo',
                        succeedColor: 'bar',
                    });

                    assertIncludes(result, {
                        color: 'blue',
                        failColor: 'blue',
                        spinnerColor: 'greenBright',
                        succeedColor: 'green',
                    });
                });
            });
        });

        describe('#purgeSpinnersOptions', () => {
            describe('spinner object', () => {
                describe('when providing invalid interval and frames', () => {
                    it('picks the default spinner', () => {
                        const spinner = { interval: 'foo', frames: 'bar' };
                        const options = purgeSpinnersOptions({ ...colors, spinner });

                        assertDeepIncludes(options, { ...colors, spinner: dots });
                    });
                });

                describe('when providing invalid interval', () => {
                    it('picks the interval from the default spinner', () => {
                        const spinner = { interval: 'foo', frames: ['-', '+'] };
                        const options = purgeSpinnersOptions({ ...colors, spinner });

                        assertDeepIncludes(options, {
                            ...colors,
                            spinner: { interval: dots.interval, frames: ['-', '+'] },
                        });
                    });
                });

                describe('when providing invalid frames', () => {
                    it('picks frames from the default spinner', () => {
                        const spinner = { interval: 100, frames: 'foo' };
                        const options = purgeSpinnersOptions({ ...colors, spinner });

                        assertDeepIncludes(options, {
                            ...colors,
                            spinner: { interval: 100, frames: dots.frames },
                        });
                    });
                });

                describe('when providing valid spinner', () => {
                    it('persists the spinner', () => {
                        const spinner = { interval: 100, frames: ['-', '+'] };
                        const options = purgeSpinnersOptions({ ...colors, spinner });

                        assertDeepIncludes(options, { ...colors, spinner });
                    });
                });
            });
        });

        describe('#purgeSpinnerOptions', () => {
            describe('when providing valid status and name', () => {
                it('persist them', () => {
                    const options = purgeSpinnerOptions({
                        ...colors,
                        text: 'text',
                        status: 'succeed',
                    });

                    assertIncludes(options, { ...colors, text: 'text', status: 'succeed' });
                });
            });

            describe('when providing invalid status and name', () => {
                it('does not persist them', () => {
                    const options = purgeSpinnerOptions({ ...colors, text: 3, status: 'foo' });

                    assertIncludes(options, colors);
                    assertLacksKeys(options, 'text', 'status');
                });
            });

            describe('when providing valid indent value', () => {
                it('persist it', () => {
                    const options = purgeSpinnerOptions({ indent: 2 });

                    assertIncludes(options, { indent: 2 });
                });
            });

            describe('when providing invalid indent value', () => {
                it('does not persist it', () => {
                    const options = purgeSpinnerOptions({ indent: 'bar' });

                    assertLacksKeys(options, 'indent');
                });

                it('rejects values outside the allowed range', () => {
                    assertIncludes(purgeSpinnerOptions({ indent: 100 }), { indent: 100 });
                    assertLacksKeys(purgeSpinnerOptions({ indent: 101 }), 'indent');
                    assertLacksKeys(purgeSpinnerOptions({ indent: -1 }), 'indent');
                });
            });

            describe('when called without arguments', () => {
                it('returns an empty object', () => {
                    assert.deepStrictEqual(purgeSpinnerOptions(), {});
                });
            });
        });

        describe('#breakText', () => {
            let columns;

            beforeEach(() => {
                columns = process.stderr.columns;
                process.stderr.columns = 10;
            });

            afterEach(() => {
                process.stderr.columns = columns;
            });

            describe('when number of lines in text is greater than the columns length', () => {
                it('adds line-breaks to the given text', () => {
                    const text = breakText(new Array(51).join('a'), 3);
                    const splitted = text.split('\n');

                    assert.strictEqual(splitted.length, 6);
                    assert.strictEqual(splitted[0].length, 6); // 10 - 3 - 1
                    assert.strictEqual(splitted[1].length, 9); // 10 - 0 - 1
                });
            });

            describe('when number of lines in text is less than the columns length', () => {
                it('does not add line-breaks to the given text', () => {
                    assert.strictEqual(breakText('12345', 0), '12345');
                });
            });

            describe('when the text contains wide characters', () => {
                it('breaks on display width without splitting a character', () => {
                    // Each ideograph is two columns wide: four of them fill the 9-column
                    // budget (10 - 0 - 1), so the fifth must move to the next line.
                    const splitted = breakText('一二三四五六', 0).split('\n');

                    assert.deepStrictEqual(splitted, ['一二三四', '五六']);
                });
            });

            describe('when the text already contains line breaks', () => {
                it('keeps them and only indents the first line', () => {
                    assert.strictEqual(breakText('ab\ncd', 0), 'ab\ncd');
                });
            });

            describe('when given unusable arguments', () => {
                it('returns an empty string', () => {
                    assert.strictEqual(breakText(42, 0), '');
                    assert.strictEqual(breakText('text', 'not-a-number'), '');
                });
            });
        });

        describe('#getLinesLength', () => {
            it('adds the prefix length to the first line only', () => {
                assert.deepStrictEqual(getLinesLength('abc\nde', 2), [5, 2]);
            });

            it('ignores ANSI colour codes', () => {
                const escape = String.fromCharCode(27);
                const colored = `${escape}[31mabc${escape}[39m`;

                assert.deepStrictEqual(getLinesLength(colored, 0), [3]);
            });

            it('measures display width rather than character count', () => {
                assert.deepStrictEqual(getLinesLength('一二', 0), [4]);
            });
        });

        describe('#moveCursorSequence', () => {
            // The single-write optimisation is only safe while these bytes stay identical
            // to what readline would have emitted call by call.
            const readlineSequence = (dx, dy) => {
                let emitted = '';
                readline.moveCursor({ write: (chunk) => { emitted += chunk; return true; } }, dx, dy);

                return emitted;
            };

            const movements = [[0, 0], [3, 0], [-3, 0], [0, 2], [0, -2], [4, -5], [-4, 5]];

            for (const [dx, dy] of movements) {
                it(`matches readline.moveCursor(${dx}, ${dy})`, () => {
                    assert.strictEqual(moveCursorSequence(dx, dy), readlineSequence(dx, dy));
                });
            }
        });

        describe('#writeStream', () => {
            it('rewinds the cursor by the number of lines written', () => {
                const chunks = [];
                const stream = { destroyed: false, write: (chunk) => chunks.push(chunk) };

                assert.strictEqual(writeStream(stream, 'a\nb\n', [1, 1]), true);
                assert.strictEqual(chunks.join(''), `a\nb\n${moveCursorSequence(0, -2)}`);
            });

            it('reports failure instead of throwing when the stream breaks', () => {
                const stream = { destroyed: false, write: () => { throw new Error('EPIPE'); } };

                assert.strictEqual(writeStream(stream, 'a\n', [1]), false);
            });

            it('reports failure on a destroyed stream', () => {
                const stream = { destroyed: true, write: () => true };

                assert.strictEqual(writeStream(stream, 'a\n', [1]), false);
            });
        });

        describe('#cleanStream', () => {
            it('emits the whole frame in a single write', () => {
                const chunks = [];
                const stream = { destroyed: false, write: (chunk) => chunks.push(chunk) };

                assert.strictEqual(cleanStream(stream, [4, 7, 2]), true);
                assert.strictEqual(chunks.length, 1, 'une seule écriture, pas 3N+3');
            });

            it('reports failure instead of throwing when the stream breaks', () => {
                const stream = { destroyed: false, write: () => { throw new Error('EPIPE'); } };

                assert.strictEqual(cleanStream(stream, [1]), false);
            });
        });
    });
});
