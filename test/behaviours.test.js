'use strict';

const expect = require('chai').expect

function expectToBehaveLikeAnUpdate(self, status) {
  const currentStatus = status === 'update' ? 'success' : status;

  describe(`#${status}`, () => {
    it(`should change the status to ${currentStatus}`, () => {
      const spinner = self.spinners[currentStatus]('spinner');
      const anotherSpinner = self.spinners.pickSpinner('another-spinner');
      expect(spinner.status).to.eq(currentStatus);
      expect(anotherSpinner.status).to.eq('spinning');
    });

    context('when specifying options', () => {
      context('when options are correct', () => {
        it('overrides the default options', () => {
          const options = { text: 'updated text', color: 'black', spinnerColor: 'black' };
          const spinner = self.spinners[status]('spinner', options);
          expect(spinner).to.include(options);
        });
      });


      context('when options are not valid', () => {
        it('mantains the previous options', () => {
          const options = { text: 42, color: 'foo', spinnerColor: 'bar' };
          const spinner = self.spinners[currentStatus]('spinner', options);
          expect(spinner).to.include({ text: 'spinner', color: 'white', spinnerColor: 'greenBright' });
        });
      });
    });
  });
}


module.exports = {
  expectToBehaveLikeAnUpdate,
}

