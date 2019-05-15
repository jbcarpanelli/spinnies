const MultiSpinner = require('./index');

MultiSpinner.initialize();

MultiSpinner.add('Lorem Ipsum is simply dummy text');

setTimeout(() => {
  MultiSpinner.add('I\'m line 2');
}, 3000)

setTimeout(() => {
  MultiSpinner.add('And I\'m ironman', { color: 'yellowBright' });
}, 5000)

setTimeout(() => {
  MultiSpinner.add('I\'m another spinner that would love to make some friends!');
}, 7000)

setTimeout(() => {
  MultiSpinner.add('Im a non-spinnable line', { status: 'none' });
}, 8000)

setTimeout(() => {
  MultiSpinner.fail(1, 'And I failed :\\');
}, 9000)

setTimeout(() => {
  MultiSpinner.success(0, 'I\'m the updated (and optional) success message', { color: 'magenta' });
}, 10000)

setTimeout(() => {
  MultiSpinner.update(2, 'I have been updated :D', { color: 'yellow' });
}, 12000)

setTimeout(() => {
  MultiSpinner.update(2, 'I have been updated again :D', { color: 'cyan' });
}, 14500)

setTimeout(() => {
  MultiSpinner.update(2, 'Again, with fancy colors!', { color: 'magenta' });
}, 17000)

setTimeout(() => {
  MultiSpinner.success(2);
}, 20000)

setTimeout(() => {
  MultiSpinner.success(3, 'Bye!', { successColor: 'blue' });
}, 18000);
