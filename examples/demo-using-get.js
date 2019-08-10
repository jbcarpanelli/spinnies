const Spinners = require('..');

const fruits = {
  interval: 150,
  frames: ['🍇', '🍈', '🍉', '🍋']
}
const spinners = new Spinners({
  // spinner: fruits,
  color: 'blue',
  succeedColor: 'green',
  failColor: 'red',
  spinnerColor: 'blueBright'
});

spinners.add('first-spinner', { text: 'Lorem Ipsum is simply dummy text', color: 'white' });

setTimeout(() => {
  spinners.add('second-spinner', { text: 'I\'m line 2' });
}, 3000)

setTimeout(() => {
  spinners.add('third-spinner', { text: 'And I\'m ironman', color: 'yellowBright' });
}, 5000)

setTimeout(() => {
  spinners.add('indented', { color: 'magenta', text: 'Im an indented line with 2 spaces',  indent: 2 });
}, 7000)

setTimeout(() => {
  spinners.add('non-spinnable', { text: 'Im a non-spinnable line',  status: 'non-spinnable' });
}, 8000)

setTimeout(() => {
  spinners.get('second-spinner').fail({ text: 'And I failed :\\' });
}, 9000)

setTimeout(() => {
  spinners.get('indented').update({ indent: 4, text: 'Im an indented line I used to have 2 space but now i have 4!' });
}, 9500)

setTimeout(() => {
  spinners.get('first-spinner').succeed({ text: 'I\'m the updated (and optional) success message', color: 'magenta' });
}, 10000)

setTimeout(() => {
  spinners.get('first-spinner').update({ text: 'I\'m the updated (and very much optional) success message', color: 'magenta' });
}, 13000)

setTimeout(() => {
  spinners.setFrames('star');
}, 11000)

setTimeout(() => {
  spinners.get('indented').succeed();
}, 11500)

setTimeout(() => {
  spinners.add('spinner-that-changes', { text: 'I am another spinner that would love to make some friends! Also I am very long, but I break into two or more lines if needed, i can break break break and break all day long, using word-wrap so words won\'t get teared up' });
}, 12000)

setTimeout(() => {
  spinners.get('third-spinner').update({ text: 'I have been updated :D', color: 'yellow', spinnerColor: 'blue' });
}, 12500)

setTimeout(() => {
  spinners.get('third-spinner').update({ text: 'I have been updated again :D', color: 'cyan' });
}, 14000)

setTimeout(() => {
  spinners.get('spinner-that-changes').update({ indent: 4, text: 'I can be indented too! I am another spinner that would love to make some friends! Also I am very long, but I break into two or more lines if needed, i can break break break and break all day long, using word-wrap so words won\'t get teared up' });
}, 14000)

setTimeout(() => {
  spinners.setFrames('arrow');
}, 16000)

setTimeout(() => {
  spinners.get('third-spinner').update({ text: 'Again, with fancy colors!',  color: 'magenta' });
}, 17000)

setTimeout(() => {
  spinners.get('third-spinner').succeed();
}, 20000)

setTimeout(() => {
  spinners.get('third-spinner').update({ text: 'Im going to be removed', color: 'red' });
}, 21000)

setTimeout(() => {
  spinners.get('third-spinner').remove();
}, 22000)

setTimeout(() => {
  spinners.get('spinner-that-changes').succeed({ text: 'Bye!', succeedColor: 'blue' });
  spinners.log();
}, 26000);

