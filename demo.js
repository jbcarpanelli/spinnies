const MultiSpinner = require('./index');

MultiSpinner.initialize();

MultiSpinner.add('first-spinner', 'Lorem Ipsum is simply dummy text');

setTimeout(() => {
  MultiSpinner.add('second-spinner', 'I\'m line 2');
}, 3000)

setTimeout(() => {
  MultiSpinner.add('third-spinner', 'And I\'m ironman', { color: 'yellowBright' });
}, 5000)

setTimeout(() => {
  MultiSpinner.add('spinner-that-changes', 'I\'m another spinner that would love to make some friends!');
}, 7000)

setTimeout(() => {
  MultiSpinner.add('non-spinnable', 'Im a non-spinnable line', { status: 'none' });
}, 8000)

setTimeout(() => {
  MultiSpinner.fail('second-spinner', 'And I failed :\\');
}, 9000)

setTimeout(() => {
  MultiSpinner.success('first-spinner', 'I\'m the updated (and optional) success message', { color: 'magenta' });
}, 10000)

setTimeout(() => {
  MultiSpinner.update('third-spinner', 'I have been updated :D', { color: 'yellow' });
}, 12000)

setTimeout(() => {
  MultiSpinner.update('third-spinner', 'I have been updated again :D', { color: 'cyan' });
}, 14500)

setTimeout(() => {
  MultiSpinner.update('third-spinner', 'Again, with fancy colors!', { color: 'magenta' });
}, 17000)

setTimeout(() => {
  MultiSpinner.success('third-spinner');
}, 20000)

setTimeout(() => {
  MultiSpinner.success('spinner-that-changes', 'Bye!', { successColor: 'blue' });
}, 18000);
