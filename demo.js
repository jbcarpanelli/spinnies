const spinners = require('./index');

spinners.initialize();

spinners.add('first-spinner', 'Lorem Ipsum is simply dummy text');

setTimeout(() => {
  spinners.add('second-spinner', 'I\'m line 2');
}, 3000)

setTimeout(() => {
  spinners.add('third-spinner', 'And I\'m ironman', { color: 'yellowBright' });
}, 5000)

setTimeout(() => {
  spinners.add('spinner-that-changes', 'I\'m another spinner that would love to make some friends!');
}, 7000)

setTimeout(() => {
  spinners.add('non-spinnable', 'Im a non-spinnable line', { status: 'none' });
}, 8000)

setTimeout(() => {
  spinners.fail('second-spinner', 'And I failed :\\');
}, 9000)

setTimeout(() => {
  spinners.success('first-spinner', 'I\'m the updated (and optional) success message', { color: 'magenta' });
}, 10000)

setTimeout(() => {
  spinners.update('third-spinner', 'I have been updated :D', { color: 'yellow' });
}, 12000)

setTimeout(() => {
  spinners.update('third-spinner', 'I have been updated again :D', { color: 'cyan' });
}, 14500)

setTimeout(() => {
  spinners.update('third-spinner', 'Again, with fancy colors!', { color: 'magenta' });
}, 17000)

setTimeout(() => {
  spinners.success('third-spinner');
}, 20000)

setTimeout(() => {
  spinners.success('spinner-that-changes', 'Bye!', { successColor: 'blue' });
}, 18000);
