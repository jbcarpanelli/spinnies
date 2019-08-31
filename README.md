# ![spin](https://i.ibb.co/4M0J13j/spin.png) Spinnies ![spin](https://i.ibb.co/4M0J13j/spin.png)
> Node.js module to create and manage multiple spinners in command-line interface programs

[![npm](https://img.shields.io/npm/v/spinnies.svg)](https://www.npmjs.com/package/spinnies)
[![CircleCI](https://circleci.com/gh/jcarpanelli/spinnies.svg?style=shield)](https://circleci.com/gh/jcarpanelli/spinnies)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center"> <br> <img src='demo.gif' title='' /> </p>


## Installation

### With npm
```
$ npm i spinnies
```

### With yarn
```
$ yarn add spinnies
```

## Usage & Example

```js
const spinnies = new Spinnies();

spinnies.add('spinner-1', { text: 'I am a spinner' });
spinnies.add('spinner-2', { text: 'I am another spinner' });
const theCoolSpinner = spinnies.add('spinner-3', { text: 'I am a cooler spinner' });

setTimeout(() => {
  spinnies.succeed('spinner-1', { text: 'Success!' });

  spinnies.get('spinner-2').fail({ text: 'Fail :(' });

  theCoolSpinner.warn({ text: 'I think i\'m fine :-' });
}, 2000);
```

## API

This library follows a **non-error-throwing** philosophy. If you provide an invalid option or an invalid value for a valid option *it will be ignored*.

### Initialization:

#### About spinner types

The `spinner` option, passed to the instance options and to spinnies.setFrames()
Follow this protocol:
- If `spinner` is a string:
  It will try to use the `spinner` as the name for a spinner from the [cli-spinners](https://github.com/sindresorhus/cli-spinners)

  *Note: cli-spinners is an optional dependencies.*
  Install it:
  - With yarn `yarn add cli-spinners`
  - With npm `npm i cli-spinners`

  If you are intrested in using this feature.

  *If cli-spinners was not installed and a string was passed as the `spinner` option*
  *the spinner will default to the default spinner*
- If `spinner` is an object
  It should have keys: `frames` and `interval`
  Where `frames` is an array of characters and `interval` is a number of milliseconds.

#### About statuses
To fully understand how spinner statuses like `success, fail, stopped, spinning` or any other custom status works
you should check out the [statues section](#statuses)

#### About spinner instance
Every spinner you create using [add()](#addname-options) will have it's own instance.

You can access that instance by storing the return value of the [add()](#addname-options) method
or using the [get()](#getname) method.

Methods of the spinnies constructor that apply to individual spinners like
[update()](#updatename-options),
[hidden()](#hiddenname-bool),
[hide()](#hidename),
[show()](#showname)
and [remove()](#removename)
Can be called on the main spinnies instance: `spinnies.update('spinner-name', options)`

Or directly on the spinner instance: `spinner.update(options)`

For every methods, examples using both ways will be provided.

#### new Spinnies([options])

Parameters
- **options** - `object`:
  - **color** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `white`. Will set the *color* option for the `spinning` (default) status.
  - **succeedColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `green`. Will set the *color* option for the `success` status.
  - **failColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `red`. Will set the *color* option for the `fail` status.
  - **spinnerColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `greenBright`. Will set the *spinnerColor* option for the `spinning` (default) status.
  - **succeedPrefix** - `string`: The default value is ✓. Will set the *prefix* for the `success` status.
  - **failPrefix** - `string`: The default value is ✖. Will set the *prefix* for the `fail` status.
  - **spinner** - **spinnerNameFromCliSpinners** = `string`
    or `object`:
      - **interval** - `number`
      - **frames** - `string[]`

    You can see the already provided spinner [here](https://github.com/jcarpanelli/spinnies/blob/master/spinners.json).
  - **disableSpins** - `boolean`: Disable spins (will still print raw messages).

*Note: If you are working in any `win32` platform, the default spin animation will be overriden. You can get rid of this defining a different spinner animation manually, or by using the integrated VSCode terminal or Windows Terminal.*

Example:

```js
const spinner = { interval: 80, frames: ['🍇', '🍈', '🍉', '🍋'] }
const spinnies = new Spinnies({ color: 'blue', succeedColor: 'green', spinner });
```

### Instance methods:

#### add(name, [options])

Adds a new spinner with the given name.

Parameters:
- **name** - `string`: spinner reference name.
- **options** - `object`:
  - **text**: - `string`: Optional text to show in the spinner. If none is provided, the `name` field will be shown.
  - **status** - `string`: Initial status of the spinner. For valid statuses see [statuses](#valid-statuses).
  - **indent**: - `number`: Optional number of spaces to add before the spinner.
  - **hidden**: - `boolean`: If true the spinner will be hidden and not print to the console. See [hidden()](#hiddenname-bool), [hide()](#hidename) and [show()](#showname).
  - **color** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `white`. Will set the *color* option for the `spinning` (default) status. This will only modify the status options for this spinner.
  - **succeedColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `green`. Will set the *color* option for the `success` status. This will only modify the status options for this spinner.
  - **failColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `red`. Will set the *color* option for the `fail` status. This will only modify the status options for this spinner.

Return value: Returns the created spinner instance.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('spinner-1');
const anotherSpinner = spinnies.add('another-spinner', { text: 'Hello, I am a spinner!', color: 'greenBright' });

```

#### get(name)

Return the spinner instance of the spinner with the given `name`.

Parameters:
- **name** - `string`: spinner reference name.

Return value: Return the spinner instance of the spinner with the given `name`.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('apple-spinner');
// do stuff
const apple = spinnies.get('apple-spinner');
// we can now do stuff with `apple`
apple.update(options);
apple.succeed();
apple.fail();
apple.remove();
// same as doing
spinnies.update('apple-spinner', options);
spinnies.succeed('apple-spinner');
spinnies.fail('apple-spinner');
spinnies.remove('apple-spinner');

```

#### pick(name)
Picks a spinner.

Parameters:
- **name** - `string`: spinner reference name.

Return value: Returns the spinner's options.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('generic-spinner-name');
// some code
const genericSpinnerNameColor = spinnies.pick('generic-spinner-name').color;

```

#### setFrames(spinner)

Updates the spinners frames.

Parameters:
- **spinner** - **spinnerNameFromCliSpinners** = `string`
  or `object`:
    - **interval** - `number`
    - **frames** - `string[]`

Return value: Returns the spinners instance (`this`).

Example:

```js
const fruits = {
  interval: 150,
  frames: ['🍇', '🍈', '🍉', '🍋']
};
const veggies = {
  interval: 100,
  frames: ['🍅', '🥒', '🥦', '🥕']
};
const spinnies = new Spinnies({ spinner: fruits });
// some code
spinnies.setFrames(vegis);

```

#### update(name, [options])

Updates the spinner with name `name` with the provided options.

Parameters:
- **name** - `string`: spinner reference name.
- **options** - `object`:
  - **text**: - `string`: Optional text to show in the spinner. If none is provided, the `name` field will be shown.
  - **status** - `string`: New status of the spinner. For valid statuses see [statuses](#valid-statuses).
  - **indent**: - `number`: Optional number of spaces to add before the spinner.
  - **hidden**: - `boolean`: If true the spinner will be hidden and not print to the console. See [hidden()](#hiddenname-bool), [hide()](#hidename) and [show()](#showname).
  - **color** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `white`. Will set the *color* option for the `spinning` (default) status. This will only modify the status options for this spinner.
  - **succeedColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `green`. Will set the *color* option for the `success` status. This will only modify the status options for this spinner.
  - **failColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `red`. Will set the *color* option for the `fail` status. This will only modify the status options for this spinner.

Return value: Returns the updated spinner instance.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
// some code
spinnies.update('spinner-1', { text: 'Hello, I am an updated text!', color: 'blue' });
// same as
spinnies.get('spinner-1').update({ text: 'Hello, I am an updated text!', color: 'blue' });
// same as
spinner1.update({ text: 'Hello, I am an updated text!', color: 'blue' });

```

#### status(name, status)

Sets the status of a spinner.
See [Setting status](#setting-status) for more ways to set the status of a spinner.

Parameters:
- **name** - `string`: spinner reference name.
- **status** - `string`: New status of the spinner. For valid statuses see [statuses](#valid-statuses).

Return value: Returns the updated spinner instance.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
spinnies.add('spinner-2', { text: 'Hello! I am a cool spinner', color: 'blue' });

// some code
spinnies.status('spinner-1', 'success');
// same as
spinnies.get('spinner-1').status('success');
// same as
spinner1.status('success'); // return `false`

spinnies.status('spinner-2', 'failed');

```

#### hidden(name, [bool])

Pass `true` to hide a spinner, pass `false` to show a spinner.
Hidden spinners will not print to the console.
Unlike [remove()](#removename) hidden spinner can be shown again after hiding them.
Use [hide()](#hidename) and [show()](#showname) for convenient.

Parameters:
- **name** - `string`: spinner reference name.
- **bool** - `boolean`: Optional. Pass `true` to hide and `false` to show. Pass nothing to return the current hidden state of the spinner.

Return value: return `true` if the spinner is hidden and return `false` if the spinner is not hidden.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
spinnies.add('spinner-2', { text: 'Hello! I am a cool spinner', color: 'blue' });
// some code
spinnies.hidden('spinner-1', true); // Hide the spinner
// some code
spinnies.hidden('spinner-1', false); // Show the spinner
// some code
spinnies.hidden('spinner-1'); // return `false`

// OR

spinner1.hidden(true); // Call on the spinner directly
// same as
spinnies.get('spinner-1').hidden(true);

```

#### hide(name)

Hide a spinner.
Use [show()](#showname) to show a spinner after hiding it.

Parameters:
- **name** - `string`: spinner reference name.

Return value: `true`.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
spinnies.add('spinner-2', { text: 'Hello! I am a cool spinner', color: 'blue' });
// some code
spinnies.hide('spinner-1');
// same as
spinnies.get('spinner-1').hide();
// same as
spinner1.hide();

```

#### show(name)

Show a spinner after it was hidden.
Use [hide()](#hidename) to hide a spinner.

Parameters:
- **name** - `string`: spinner reference name.

Return value: `false`.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
spinnies.add('spinner-2', { text: 'Hello! I am a cool spinner', color: 'blue' });

// WE HID THE SPINNER USING hide()

// some code
spinnies.show('spinner-1');
// same as
spinnies.get('spinner-1').show();
// same as
spinner1.show();

```

#### remove(name)

Remove a spinner, which will make the spinner disappear and not rerender.

Parameters:
- **name** - `string`: spinner reference name.

Return value: `undefined`.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
spinnies.add('spinner-2', { text: 'Hello! I am a cool spinner', color: 'blue' });
// some code
spinnies.remove('spinner-1');
// same as
spinnies.get('spinner-1').remove();
// same as
spinner1.remove();

```

#### stopAll([status])

Stops the spinners and sets all of the active spinners statuses to the provided status, which can any [valid status](#valid-statuses). You can see an example [here](https://github.com/jcarpanelli/spinnies/blob/master/examples/demo-stop-all.js).

Parameters:
- **status** - `string`: Optional. Status to set for all of the active spinner. Defaults to 'stopped'

Example:

```js
const spinnies = new Spinnies();
spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
spinnies.add('spinner-2', { text: 'Hello! I am a cool spinner', color: 'blue' });

// some code
spinnies.stopAll();
// or
spinnies.stopAll('failed'); // Fail all active spinners
```

#### hasActiveSpinners()
Return value: returns `true` if there are still active spinners.

#### log(optionalLogFunction = console.log)

Logs the **debug** logs that were logged by spinnies instance, using console.log or a custom log function

Parameters:
- **optionalLogFunction** - `function`: If specified, will be used instead of console.log.

Return value: Returns the logs array.

Example:

```js
function customLogFunction(str) {
  SomethingSomething(str);
}
const spinnies = new Spinnies();
spinnies.add('spinner-1');
// some code
spinnies.log();
// or
spinnies.log(customLogFunction);
```

#### getLogs()

Returns an array with all of the **debug** logs that were logged by the spinnies instance.

Return value: Returns the logs array.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('spinner-1');
// some code
const logs = spinnies.getLogs();
```

### Statuses

#### Valid statuses
The default statuses are:
- `spinning`, *aliases:* `default, active, spin`, *static:* `false`
- `fail`, *aliases:* `failed, error`, *static:* `true`, *default color:* `green`
- `success`, *aliases:* `succeed, done`, *static:* `true`, *default color:* `red`
- `warn`, *alias* `warning`, *static:* `true`, *default color:* `yellow`
- `info`, *alias* `information`, *static:* `true`, *default color:* `blue`
- `non-spinnable`, *aliases:* `static, inactive`, *static:* `true`, *prefix* `false`
- `stopped`, *aliases:* `stop, cancel`, *static:* `true`, *prefix* `false`, *default color:* `gray`

Also any status you manually set using [configureStatus](#configureStatus) is valid.

#### Compatibility
For backwards compatibility reasons and convenient: passing `succeedColor`, `failColor`, `warnColor`, `infoColor`, `failPrefix`, `succeedPrefix`, `warnPrefix`, `infoPrefix`, `color` and `spinnerColor`
To the [spinnies constructor](#new-spinniesoptions), [spinnies.add()](#addname-options) and [spinnies.update()](#updatename-options) will set the status options.

Passing those options to [spinnies.add()](#addname-options) and [spinnies.update()](#updatename-options)
will set those options for the status specific to these spinners. That way every spinner can have a different `succeedColor` for example.

#### Setting status
There are 3 ways to set the status of a spinner.

1. Using the [update()](#updatename-options) method and passing `status`.
```js
spinner.update({ status: 'statusName' })
// or
spinnies.update('spinnerName', { status: 'statusName' });
// e.g
spinner.update({ status: 'success' });
```
2. Using the [status()](#statusname-status) method.
```js
spinner.status('statusName')
// e.g
spinner.status('fail');
```
3. Use the status name as the method name. If you create a custom status and a property with that status name exists on the spinnies constructor (add, update, get, pick etc...) it would not override that property and you wouldn't be able to set that status using this method.
```js
spinner.statusName()
// or
spinners.statusName('spinnerName')

// e.g
spinner.success();
// using alias
spinner.succeed();

// failing a spinner
spinner.fail();

// warning a spinner
spinner.warn();
// or
spinner.warning();

// stopping a spinner
spinner.stop();
```

### StatusRegistry
Status registry is used to create and configure spinner statuses.
A single instance of StatusRegistry is shared between the main `spinners` instance
and the rest of the spinners.

**Note: StatusRegistry is not used to set the status of a spinner just to store information about statuses, like prefixes,colors, ect...**
**To set the status of a spinner see [setting statuses](#setting-status)**

#### configureStatus

Configure a status with the `name`. Will create a status with that `name` if it doesn't exist or modify the status options if it does exist.
Will try to set the spinnies instance[`name`] as a function to set that status.

Parameters:
- **name** - `string`: The name of the status.
- **options** - `object`:
  - **aliases**: - `string` || `string[]`: Optional string or array of string, an alias will be created to this status `name` for every string. Modifying the original status will also apply for the aliases.
  - **textColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). This color will be applied to the spinner's text whenever this status is the spinner's active status.
  - **spinnerColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). This color will be applied to the spinner's spinner whenever this status is the spinner's active status. The default value is `greenBright`.
  - **prefixColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). This color will be applied to the spinner's prefix whenever this status is the spinner's active status. The default value is `greenBright`.
  - **prefix** - `string` || `false`: The prefix for the spinner. Can be set to false to not render a prefix.
  - **noSpaceAfterPrefix** - `boolean`: By default the spinner/prefix will have a space rendered. Set this to `false` to disable this behavior.
  - **isStatic** - `boolean`: A static status will not spin and show the `prefix` at the start of the spinner. If this is set to `true` the `prefix` will be rendered with the `prefixColor` and an optional space after it as long as `noSpaceAfterPrefix` is set to `false`. If this option is `false`, The spinner will spin (use the current frame...) and the prefix will not render. Meaning when this is false, `prefix`, `prefixColor` and `noSpaceAfterPrefix` are completely meaningless. Defaults to `false`.
  - **isDone** - `booolean`: By default statuses are treated as 'done'
  if the `isStatic` option is `true`. For example statuses like success, fail and stopped are treated as done, while the *spinning* status is not treated as 'done'.
  Whenever a status of a spinner is treated as 'done' spinnies will know
  to complete that spinner and to stop spinning when ever all spinners are done.
  By default any *static* status with `isStatic` set to true will also be treated as 'done'. The `isDone` option is rarely ever used since the default behavior suits most statuses. This is good for example if we want to create a **pending** status. The **pending** status can be good for tasks that will be executed in the future but are not running yet. We don't want spinnies to think a spinner with the **pending** status is 'done' but we also don't want a spinner with a **pending** status to spin.

Return value: Returns the StatusRegistry instance (`this`).

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I use the default status which is "spinning" my "color" option is set to yellow which just means my default status color is yellow', color: 'yellow' });
spinnies.statusRegistry.configureStatus('pinkify', {
  aliases: ['pinky', 'pinkful'],
  textColor: 'magenta',
  spinnerColor: 'magenta'
});

spinnies.statusRegistry.configureStatus('santa', {
  textColor: 'red',
  isStatic: true,
  prefix: '🎅'
});

/* When modifying an existing status
   it is important to use the original name of the status
   and not an alias name.
   Any changes to the original status will also apply to that status aliases */
spinnies.statusRegistry.configureStatus('fail' /* GOOD */, {
  prefixColor: 'cyan' // same as `new Spinnies({ failColor: 'cyan' })`
});
// spinnies.statusRegistry.configureStatus('failed' /* BAD: don't use alias names */);

// some code
spinner1.update({
  status: 'pinkful',
  text: 'Hi there! I am now completely pink (magenta but you know), my text and my spinner. I still spin since this status is not "static"',
});
spinner1.update({
  status: 'spinning',
  text: 'I\'m yellow again! Back to my default status'
});
spinner1.pinkify();

// some code
spinner1.status('santa');
// or
spinner1.santa();

spinner1.fail();
// or
spinner1.failed();

```

#### getStatus(nameOrAlias)

Return the status options for the specified status.


## Contribute

Star it, fork it, improve it, PR it! :raised_hands:.


## Acknowledgements

Thanks to [chalk](https://github.com/chalk/chalk) for helping making this lib colorful :rainbow: and to [ora](https://github.com/sindresorhus/ora) which was a great inspiration :unicorn:.

## License

[MIT](https://github.com/jcarpanelli/spinnies/blob/master/LICENSE)
