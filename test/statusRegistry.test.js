'use strict';

const expect = require('chai').expect

const { StatusRegistry } = require('../index');

describe('StatusRegistry', () => {
  beforeEach('set options', () => {
    this.statusRegistry = new StatusRegistry('customDefault');

    this.statusRegistry.configureStatus('customDefault', {
      aliases: ['spin', 'active', 'default'],
      spinnerColor: 'cyan',
      textColor: 'cyan',
      rawRender({ text }) {
        return `- ${text}`;
      }
    });
    this.statusRegistry.configureStatus('fail', {
      aliases: ['failed', 'error'],
      prefix: 'x',
      isStatic: true,
      noSpaceAfterPrefix: false,
      prefixColor: 'red',
      textColor: 'red',
      rawRender({ text, options, statusOptions }) {
        return `${statusOptions.prefix} ${text}`;
      }
    });
  });

  describe('getStatus', () => {
    it('returns status when providing name', () => {
      expect(this.statusRegistry.getStatus('fail')).to.include({
        prefix: 'x',
        isStatic: true,
        noSpaceAfterPrefix: false,
        prefixColor: 'red',
        textColor: 'red'
      });
    });

    it('returns status when providing alias', () => {
      expect(this.statusRegistry.getStatus('error')).to.include({
        prefix: 'x',
        isStatic: true,
        noSpaceAfterPrefix: false,
        prefixColor: 'red',
        textColor: 'red'
      });
    });

    it('returns the default status when providing non-existing status', () => {
      expect(this.statusRegistry.getStatus('non-existing')).to.include({
        spinnerColor: 'cyan',
        textColor: 'cyan'
      });
    });
  });

  describe('configureStatus', () => {
    describe('modify existing statuses', () => {
      describe('keeps old values but changes new', () => {
          it('modifies status and "aliases"', () => {
            expect(this.statusRegistry.getStatus('fail')).to.include({
              prefix: 'x',
              isStatic: true,
              noSpaceAfterPrefix: false,
              prefixColor: 'red',
              textColor: 'red'
            });
            this.statusRegistry.configureStatus('fail', {
              prefixColor: 'yellow'
            });
            
            expect(this.statusRegistry.getStatus('fail')).to.include({
              prefix: 'x',
              isStatic: true,
              noSpaceAfterPrefix: false,
              prefixColor: 'yellow',
              textColor: 'red'
            });
            expect(this.statusRegistry.getStatus('failed').prefixColor).to.equal('yellow');
          });
      });
    });
  });
});
