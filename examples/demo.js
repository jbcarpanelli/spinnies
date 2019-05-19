const Spinners = require('..');

const fruits = { 
  interval: 150,
  frames: ['🍇', '🍈', '🍉', '🍋']
}
const spinners = new Spinners({
  spinner: fruits,
  color: 'blue',
  successColor: 'green',
  failColor: 'black',
  spinnerColor: 'red'
});

spinners.add('first-spinner', { text: 'Lorem Ipsum is simply dummy text', color: 'white' });

setTimeout(() => {
  spinners.add('second-spinner', { text: 'I\'m line 2' });
}, 3000)

setTimeout(() => {
  spinners.add('third-spinner', { text: 'And I\'m ironman', color: 'yellowBright' });
}, 5000)

setTimeout(() => {
  spinners.add('spinner-that-changes', { text: 'I\'m another spinner that would love to make some friends!' });
}, 7000)

setTimeout(() => {
  spinners.add('non-spinnable', { text: 'Im a non-spinnable line',  status: 'non-spinnable' });
}, 8000)

setTimeout(() => {
  spinners.fail('second-spinner', { text: 'And I failed :\\' });
}, 9000)

setTimeout(() => {
  spinners.success('first-spinner', { text: 'I\'m the updated (and optional) success message', color: 'magenta' });
}, 10000)

setTimeout(() => {
  spinners.update('third-spinner', { text: 'I have been updated :D', color: 'yellow', spinnerColor: 'blue' });
}, 12000)

setTimeout(() => {
  spinners.update('third-spinner', { text: 'I have been updated again :D', color: 'cyan' });
}, 14500)

setTimeout(() => {
  spinners.update('third-spinner', { text: 'Again, with fancy colors!',  color: 'magenta' });
}, 17000)

setTimeout(() => {
  spinners.success('third-spinner');
}, 20000)

setTimeout(() => {
  spinners.success('spinner-that-changes', { text: 'Bye!', successColor: 'blue' });
}, 18000);
