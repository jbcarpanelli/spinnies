const Spinners = require('..');

function wait(ms, cb) {
  setTimeout(cb, ms);
}

const spinners = new Spinners({
  spinner: 'dots',
  color: 'blue',
  succeedColor: 'green',
  failColor: 'red',
  spinnerColor: 'blueBright'
});

spinners.add('first-spinner', { text: 'Lorem Ipsum is simply dummy text', color: 'white' });

wait(2500, () => {
  spinners.add('second-spinner', { text: 'I\'m line 2' });
})

wait(5000, () => {
  spinners.add('third-spinner', { text: 'And I\'m ironman', color: 'yellowBright', spinnerColor: 'yellowBright' });
})

wait(7500, () => {
  spinners.add('spiderman', { text: 'And I\'m spiderman', color: 'redBright', spinnerColor: 'redBright' });
})

wait(9000, () => {
  spinners.add('indented', { color: 'magenta', text: 'Im an indented line with 2 spaces', indent: 2 });
})

wait(11000, () => {
  spinners.add('non-spinnable', { text: "Im a line that doesn't spin. Don't judge me :(",  status: 'non-spinnable' });
})

wait(13500, () => {
  spinners.add('spinner-that-changes', { color: 'cyan', text: 'I am another spinner that would love to make some friends! Also I am very long, but I break into two or more lines if needed.' });
})

wait(16000, () => {
  spinners.setFrames('arrow');
})

wait(17000, () => {
  spinners.info('second-spinner', { text: 'Second line is a bit confused :p Give it some INFO' });
})

wait(19500, () => {
  spinners.warn('third-spinner', { text: 'Ironman got a warning for using illegal weapons :C' });
})

wait(21000, () => {
  spinners.success('spiderman', { text: 'Spiderman has won the battle!' });
})

wait(23000, () => {
  spinners.fail('first-spinner', { text: 'I failed OwO' });
})

wait(25000, () => {
  spinners.stop('indented', { text: 'I have been stopped ^-^' });
})

wait(26500, () => {
  spinners.text('spinner-that-changes', 'I have been updated :D');
})

wait(28000, () => {
  spinners.text('spinner-that-changes', 'I have been updated again :D');
})

wait(30000, () => {
  spinners.update('spinner-that-changes', { text: 'Again, with fancy colors!',  color: 'magenta', spinnerColor: 'magenta' });
})

wait(32000, () => {
  spinners.add('ephemeral-spinner', { text: 'Im an ephemeral spinner and will dissapear soon :(' })
})

wait(34500, () => {
  spinners.remove('ephemeral-spinner');
});

wait(36500, () => {
  spinners.succeed('spinner-that-changes', { text: 'Bye!', succeedColor: 'magentaBright' });
});
