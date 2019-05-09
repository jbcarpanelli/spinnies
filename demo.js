const MultiSpinner = require('./index');

MultiSpinner.initialize();

MultiSpinner.add('Lorem Ipsum is simply dummy text');

setTimeout(() => {
  MultiSpinner.success(0, 'I\'m the updated (and optional) success message', { color: 'magenta' });
}, 5000)

