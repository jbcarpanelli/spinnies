# ![spin](https://i.ibb.co/4M0J13j/spin.png) Spinnies ![spin](https://i.ibb.co/4M0J13j/spin.png)
> Node.js module to create and manage multiple spinners in command-line interface programs

[![npm](https://img.shields.io/npm/v/spinnies.svg)](https://www.npmjs.com/package/spinnies)
[![CircleCI](https://circleci.com/gh/jcarpanelli/spinnies.svg?style=shield)](https://circleci.com/gh/jcarpanelli/spinnies)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center"> <br> <img src='https://s3.us-west-2.amazonaws.com/jcarpanelli/termtosvg_zb90005u.svg' title='' /> </p>


## Installation

```
$ npm i spinnies
```

## Usage & Example

```js
const spinnies = new Spinnies();

spinnies.add('spinner-1', { text: 'I am a spinner' });
spinnies.add('spinner-2', { text: 'I am another spinner' });

setTimeout(() => {
  spinnies.succeed('spinner-1', { text: 'Success!' });
  spinnies.fail('spinner-2', { text: 'Fail :(' });
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
  *the spinner will default to the platformDefaultSpinner*
- If `spinner` is an object
  It should have keys: `frames` and `interval`
  Where `frames` is an array of characters and `interval` is a number of milliseconds.


#### new Spinnies([options])

Parameters
- **options** - `object`:
  - **color** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `white`.
  - **succeedColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `green`.
  - **failColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `red`.
  - **spinnerColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors). The default value is `greenBright`.
  - **succeedPrefix** - `string`: The default value is ✓.
  - **failPrefix** - `string`: The default value is ✖.
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
  - **color** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).
  - **succeedColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).
  - **failColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).

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
  - **color** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).
  - **succeedColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).
  - **failColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).

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

#### succeed(name, [options])

Sets the specified spinner status as `succeed`.

Parameters:
- **name** - `string`: spinner reference name.
- **options** - `object`:
  - **text**: - `string`: Optional text to show in the spinner. If none is provided, the `name` field will be shown.
  - **succeedColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).

Return value: Returns the succeeded spinner instance.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
// some code
spinnies.succeed('spinner-1', { text: 'Success!', successColor: 'greenBright' });
// same as
spinnies.get('spinner-1').succeed({ text: 'Success!', successColor: 'greenBright' });
// same as
spinner1.succeed({ text: 'Success!', successColor: 'greenBright' });

```

#### fail(name, [options])

Sets the specified spinner status as `fail`.

Parameters:
- **name** - `string`: spinner reference name.
- **options** - `object`:
  - **text**: - `string`: Optional text to show in the spinner. If none is provided, the `name` field will be shown.
  - **failColor** - `string`: Any valid [chalk color](https://github.com/chalk/chalk#colors).

Return value: Returns the spinner's options.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
// some code
spinnies.fail('spinner-1', { text: 'I failed', failColor: 'redBright' });
// same as
spinnies.get('spinner-1').fail({ text: 'I failed', failColor: 'redBright' });
// same as
spinner1.fail({ text: 'I failed', failColor: 'redBright' });

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

Stops the spinners and sets the non-succeeded and non-failed ones to the provided status, which can be `succeed`, `fail` or `stopped`. You can see an example [here](https://github.com/jcarpanelli/spinnies/blob/master/examples/demo-stop-all.js).

#### hasActiveSpinners()
Return value: returns `false` if all spinners have succeeded, failed or have been stopped.

#### log(optionalLogFunction = console.log)

Logs the debug logs that were logged by spinnies instance, using console.log or a custom log function

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

Returns an array with all of the debug logs that were logged by the spinnies instance.

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

Also any status you manually set using [configureStatus](#configureStatus) is valid.

#### Compatibility
For backwards compatibility reasons and convenient: passing succeedColor, failColor, failPrefix ect...
To spinnies will set the status options.
The "legit" way is to use [configureStatus](#configureStatus)

#### Setting status
There are 3 ways to set the status of a spinner.

1.
```js
spinner.update({ status: 'statusName' })
// or
spinners.update('spinnerName', { status: 'statusName' });
```
2. If you are just setting the status without changing any other options (text, indent...) you should use this method, it skips a bunch of option purging and checks.
```js
spinner.status('statusName')
// or
spinners.status('spinnerName', 'statusName')
```
3. When possible
```js
spinner.statusName()
// or
spinners.statusName('spinnerName')
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
  - **prefix** - `string`: The prefix for the spinner.
  - **isStatic** - `boolean`: A static status will not spin and show the `prefix` at the start of the spinner. If this is set to `true` the `prefix` will be rendered with the `prefixColor` and an optional space after it as long as `noSpaceAfterPrefix` is set to `false`. If this option is `false`, The spinner will spin (use the current frame...) and the prefix will not render. Meaning when this is false, `prefix`, `prefixColor` and `noSpaceAfterPrefix` are completely meaningless. Defaults to `false`.
Return value: Returns the spinnies instance (`this`).

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

```

#### getStatus(nameOrAlias)

Return the status options for the specified status.

## Contribute

Star it, fork it, improve it, PR it! :raised_hands:.


## Acknowledgements

Thanks to [chalk](https://github.com/chalk/chalk) for helping making this lib colorful :rainbow: and to [ora](https://github.com/sindresorhus/ora) which was a great inspiration :unicorn:.

## License

[MIT](https://github.com/jcarpanelli/spinnies/blob/master/LICENSE)
