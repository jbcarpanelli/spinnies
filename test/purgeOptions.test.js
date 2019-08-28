'use strict';

const expect = require('chai').expect

const {
	purgeOptions,
	type,
	oneOf,
	equal,
	all,
	some
} = require('../purgeOptions');

function expectRuleToBeFalse(rule, ruleOpts, value) {
	const subj = rule(ruleOpts);
	expect(subj(value)).to.be.false;
}

function expectRuleToBeTrue(rule, ruleOpts, value) {
	const subj = rule(ruleOpts);
	expect(subj(value)).to.be.true;
}

describe('helpers', () => {
	describe('#type', () => {
		context('when providing invalid types', () => {
			it('returns false', () => {
				expectRuleToBeFalse(type, 'undefined', 'im-defined');
				expectRuleToBeFalse(type, 'string', 90);
				expectRuleToBeFalse(type, 'number', 'not-a-number');
				expectRuleToBeFalse(type, 'object', 76);
				expectRuleToBeFalse(type, 'boolean', {});
				expectRuleToBeFalse(type, 'function', true);
			});
		});

		context('when providing valid types', () => {
			it('returns true', () => {
				expectRuleToBeTrue(type, 'undefined', undefined);
				expectRuleToBeTrue(type, 'string', 'string-over-here');
				expectRuleToBeTrue(type, 'number', 1);
				expectRuleToBeTrue(type, 'object', {});
				expectRuleToBeTrue(type, 'boolean', true);
				expectRuleToBeTrue(type, 'function', () => '');
			});
		});
	});

	describe('#equal', () => {
		context('when providing different values', () => {
			it('returns false', () => {
				expectRuleToBeFalse(equal, undefined, 'im-defined');
				expectRuleToBeFalse(equal, 'string', 'not-like-me');
				expectRuleToBeFalse(equal, 90, '90');
				expectRuleToBeFalse(equal, 55, 76);
				expectRuleToBeFalse(equal, true, false);
			});
		});

		context('when providing same values', () => {
			it('returns true', () => {
				expectRuleToBeTrue(equal, undefined, undefined);
				expectRuleToBeTrue(equal, 'string', 'string');
				expectRuleToBeTrue(equal, 90, 90);
				expectRuleToBeTrue(equal, 55, 55);
				expectRuleToBeTrue(equal, true, true);
			});
		});
	});

	describe('#oneOf', () => {
		context('when providing a value that is not in the possibilities array', () => {
			it('returns false', () => {
				expectRuleToBeFalse(oneOf, ['a', 'b', 'c'], 'd');
				expectRuleToBeFalse(oneOf, [1, 2, 3], 4);
				expectRuleToBeFalse(oneOf, [true, false], 'false');
				expectRuleToBeFalse(oneOf, [true, false], 90);
			});
		});

		context('when providing a value that is in the possibilities array', () => {
			it('returns true', () => {
				expectRuleToBeTrue(oneOf, ['a', 'b', 'c'], 'b');
				expectRuleToBeTrue(oneOf, [1, 2, 3], 3);
				expectRuleToBeTrue(oneOf, [true, false], false);
				expectRuleToBeTrue(oneOf, [true, false], true);
			});
		});
	});

	describe('#some', () => {
		context('when providing a value that doesn\'t match any of the requirements', () => {
			it('returns false', () => {
				expectRuleToBeFalse(some, [type('string'), type('number')], true);
				expectRuleToBeFalse(some, [type('string'), type('number')], {});

				// should probs use oneOf for this one, But tests are tests...
				expectRuleToBeFalse(some, [equal('green'), equal('yellow'), equal('red')], 'blue');
				expectRuleToBeFalse(some, [equal('green'), equal('yellow'), equal('red')], 'cyan');

				expectRuleToBeFalse(some, [(value) => value > 100, (value) => value < 10], 30);
				expectRuleToBeFalse(some, [(value) => value > 100, (value) => value < 10], 20);
			});
		});

		context('when providing a value that matches at least one of the requirements', () => {
			it('returns true', () => {
				expectRuleToBeTrue(some, [type('string'), type('number')], 65);
				expectRuleToBeTrue(some, [type('string'), type('number')], 'string');

				expectRuleToBeTrue(some, [equal('green'), equal('yellow'), equal('red')], 'red');
				expectRuleToBeTrue(some, [equal('green'), equal('yellow'), equal('red')], 'green');

				expectRuleToBeTrue(some, [(value) => value > 100, (value) => value < 10], 200);
				expectRuleToBeTrue(some, [(value) => value > 100, (value) => value < 10], 5);
			});
		});
	});

	describe('#all', () => {
		beforeEach('define rules', () => {
			this.rule1 = [(value) => value < 100, (value) => value > 10]; // less than a 100 but bigger than 10
			this.rule2 = [(value) => value.startsWith('a'), (value) => value.endsWith('t')]; // starts with 'a' & end with 't'
			this.rule3 = [(value) => value.length === 3, (value) => value[0] === 'black']; // array with length of 3 and first item of 'first item'
		});

		context('when providing a value that doesn\'t match any of the requirements', () => {
			it('returns false', () => {
				expectRuleToBeFalse(all, this.rule1, 'what there is no number that is less than a 100 but bigger than 10?'); //  ignore me

				expectRuleToBeFalse(all, this.rule2, 'milk');
				expectRuleToBeFalse(all, this.rule2, 'fish');

				expectRuleToBeFalse(all, this.rule3, ['(not black) length of', 'two']);
				expectRuleToBeFalse(all, this.rule3, ['(not black) length', 'of', 'four', 4]);
			});
		});

		context('when providing a value that matches only one of the requirements', () => {
			it('returns false', () => {
				expectRuleToBeFalse(all, this.rule1, 200);
				expectRuleToBeFalse(all, this.rule1, 5);

				expectRuleToBeFalse(all, this.rule2, 'avocado');
				expectRuleToBeFalse(all, this.rule2, 'cat');

				expectRuleToBeFalse(all, this.rule3, ['(not black) length', 'of', 3]);
				expectRuleToBeFalse(all, this.rule3, ['black', 'and  yellow']);
			});
		});

		context('when providing a value that matches all of the requirements', () => {
			it('returns true', () => {
				expectRuleToBeTrue(all, this.rule1, 50);
				expectRuleToBeTrue(all, this.rule1, 40);

				expectRuleToBeTrue(all, this.rule2, 'ant');
				expectRuleToBeTrue(all, this.rule2, 'arrest');

				expectRuleToBeTrue(all, this.rule3, ['black', 'of', 3]);
				expectRuleToBeTrue(all, this.rule3, ['black', 'and', 'yellow']);
			});
		});
	});
});