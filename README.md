# ![spin](https://i.ibb.co/4M0J13j/spin.png) Dreidels ![spin](https://i.ibb.co/4M0J13j/spin.png)
> Node.js module to create and manage multiple spinners in command-line interface programs

[![CircleCI](https://circleci.com/gh/SweetMNM/dreidels.svg?style=svg)](https://circleci.com/gh/SweetMNM/dreidels)
[![npm](https://img.shields.io/npm/v/dreidels?style=flat-square)](https://www.npmjs.com/package/dreidels)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<p align="center"> <br> <img src='demo.gif' title='' /> </p>

#### Note:
This project was forked from the original [spinnies](https://www.npmjs.com/package/spinnies) package.

Without the amazing work of [jcarpanelli](https://github.com/jcarpanelli/), this would not have been possible.

I have opened a [PR](https://github.com/jcarpanelli/spinnies/pull/17) but the project seems to be unmaintained. Which is why I decided to publish this package.

You can see all the changes made from the original spinnies in the PR. I kept the original package philosophy
of **non-error-throwing** while also creating tests and demos for all the new features.

**Although the name of the package changed, the programmatic name stayed as `spinnies`. Which is why in the examples we still refer to it as `spinnies`**

[Meaning of the name](https://en.wikipedia.org/wiki/Dreidel)

## Features
:dolls: Create and manage multiple spinners at the same time

:key: Control each spinner from it's own instance

:clapper: Support for rendering in CI environments

:rainbow: Colorful spinners thanks to [chalk](https://github.com/chalk/chalk)

:loop: (Optional) Use spinners from the [cli-spinners library](https://github.com/sindresorhus/cli-spinners)

:musical_score: Long texts will be wrapped across multiple lines based on the terminal size thanks to [wordwrapjs](https://github.com/75lb/wordwrapjs)

:scroll: Indent spinners

:snake: Temporarily hide spinners and show them later

:pray: Bind a spinner to a `Promise`. The spinner will fail if the promise rejects and succeed if it's resolved

:vertical_traffic_light: Bind a spinner to an `Observable`.
Use `next()` to update the spinner text,
`complete()` to succeed the spinner
and `error()` to fail the spinner with an optional error message or `Error`

:space_invader: Change the spinner animation while spinning

:maple_leaf: Completely remove a spinner

:tennis: Easily update existing spinners

:sparkles: 'Non-spinnable' lines

:gem: Change the status of a spinner. Each status has it's unique colors and symbols

:white_check_mark: Preset 'success' status

:x: Preset 'fail' status

:warning: Preset 'warn' status

:information_source: Preset 'info' status

:baseball: Preset 'stopped' status

:u5272: Create your own custom statuses

:paw_prints: Custom statuses are highly customizable to suit your needs

## Table of Contents

- [Installation](#installation)
  - [With npm](#with-npm)
  - [With yarn](#with-yarn)
- [Usage & Example](#usage--example)
- [API](#api)
  - [Abouts](#abouts)
    - [About spinner types](#about-spinner-types)
    - [About statuses](#about-statuses)
    - [About spinner instance](#about-spinner-instance)
  - [Initialization](#initialization)
  - [Instance methods](#instance-methods)
    - [add](#addname-options)
    - [get](#getname)
    - [pick](#pickname)
    - [setFrames](#setframesspinner)
    - [update](#updatename-options)
    - [status](#statusname-status)
    - [text](#textname-text)
    - [indent](#indentname-indent)
    - [hidden](#hiddenname-bool)
    - [hide](#hidename)
    - [show](#showname)
    - [bind](#bindname-task)
    - [remove](#removename)
    - [stopAll](#stopallstatus)
    - [hasActiveSpinners](#hasactivespinners)
  - [Statuses](#statuses)
    - [Valid statuses](#valid-statuses)
    - [Compatibility](#compatibility)
    - [Setting status](#setting-status)
  - [StatusRegistry](#statusregistry)
    - [configureStatus](#configurestatusname-options)
    - [getStatus](#getstatusnameOrAlias)
- [Contribute](#contribute)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Installation

### With npm
```
npm i dreidels
```

### With yarn
```
yarn add dreidels
```

## Usage & Example

```js
const Spinnies = require('dreidels')
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

### Abouts

#### About spinner types

The `spinner` option, passed to the [spinnies constructor](#new-spinniesoptions) and to [setFrames()](#setframesspinner)
Follow this protocol:
- If `spinner` is a string:
  It will try to use the `spinner` as the name for a spinner from the [cli-spinners package](https://github.com/sindresorhus/cli-spinners)

  *Note: cli-spinners is an optional dependency.*
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
[show()](#showname),
[status()](#statusname-status),
[text()](#textname-text),
[indent()](#indentname-indent),
and [remove()](#removename)
Can be called on the main spinnies instance: `spinnies.update('spinner-name', options)`

Or directly on the spinner instance: `spinner.update(options)`

For every methods, examples using both ways will be provided.

### Initialization:

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
  - **stream** - `stream.Writable`: Spinnies will write output to this stream. Defaults to `process.stderr`.
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
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am a spinner with the initial "spinning" status', color: 'green' });
spinnies.add('spinner-2', { text: 'Hello! I am a cool spinner', color: 'blue' });

// some code
spinnies.status('spinner-1', 'success');
// same as
spinnies.get('spinner-1').status('success');
// same as
spinner1.status('success');

spinnies.status('spinner-2', 'failed');

```

#### text(name, text)

Sets the text of a spinner.

Parameters:
- **name** - `string`: spinner reference name.
- **text** - `string`: New text of the spinner.

Return value: Returns the updated spinner instance.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text' });

// some code
spinnies.text('spinner-1', 'Hello, I am an updated text!');
// same as
spinnies.get('spinner-1').text('Hello, I am an updated text!');
// same as
spinner1.text('Hello, I am an updated text!');

```

#### indent(name, indent)

Sets the indent of a spinner.

Parameters:
- **name** - `string`: spinner reference name.
- **indent**: - `number`: number of spaces to add before the spinner.

Return value: Returns the updated spinner instance.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am indented with 2 spaces, but soon will upgrade to 4 spaces :D', indent: 2 });

// some code
spinnies.indent('spinner-1', 4);
// same as
spinnies.get('spinner-1').indent(4);
// same as
spinner1.indent(4);

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

#### bind(name, task)

Bind a spinner to a Promise or an Observable.

When `task` is a **Promise**:

If that promise resolves, the spinner will succeed.
Passing a string to the `resolve` call will update the spinner text when succeeding it.

If that promise rejects, the spinner will fail.
Passing a string to the `reject` call will update the spinner text when failing it.
Passing an `Error` to the `reject` call will format that error and update the spinner text with the error message and stack.

When `task` is an **Observable**:

Calling `next()` with a string will update the spinner text. you can call `next()` multiple times.

Calling `complete()` will succeed the spinner. Note: Observables do not allow passing arguments to `complete()`, meaning you can't change the text using `complete()`.

Calling `error()` with a string will update the spinner text when failing it.

Calling `error()` with an `Error` will format that error and update the spinner text with the error message and stack.


Parameters:
- **task** - `Promise` || `Observable`: a Promise or an Observable to bind to that spinner.

Return value: Returns the spinner instance.

Example:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });

// How to bind?
spinnies.bind('spinner-1', task);
// same as
spinnies.get('spinner-1').bind(task);
// same as
spinner1.bind(task);

```

Example with a resolved `Promise`:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });

spinner1.bind(Promise.resolve('Success :D'));

```

Example with a rejected `Promise`:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });

spinner1.bind(Promise.reject('I failed :('));

```

Example with a rejected `Promise`, passing an `Error`:

```js
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });

spinner1.bind(Promise.reject(new Error('Something went wrong :/')));

```

Example with an `Observable`:

```js
const { Observable } = require('rxjs');
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });

spinner1.bind(new Observable(subscriber => {
  setTimeout(() => {
    subscriber.next('I was updated!');
  }, 1500);

  setTimeout(() => {
    subscriber.next('I was updated again!');
  }, 3000);

  setTimeout(() => {
    subscriber.next('and again...');
  }, 4500);

  setTimeout(() => {
    subscriber.complete();
  }, 5000);
}));

```

Example with an `Observable` that fails:

```js
const { Observable } = require('rxjs');
const spinnies = new Spinnies();
const spinner1 = spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });

spinner1.bind(new Observable(subscriber => {
  setTimeout(() => {
    subscriber.next('Doing some stuff...');
  }, 1000);

  setTimeout(() => {
    subscriber.next('More important stuff...');
  }, 3000);

  setTimeout(() => {
    subscriber.error('Something is not right');
  }, 4500);

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

#### configureStatus(name, options)

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

Thanks to [chalk](https://github.com/chalk/chalk) `(<=v0.5.1)` and [colorette](https://github.com/jorgebucaran/colorette) `(>=v0.5.2)` for helping to make this lib colorful :rainbow: and to [ora](https://github.com/sindresorhus/ora) which was a great inspiration :unicorn:.

## License

[MIT](https://github.com/SweetMnM/spinnies/blob/master/LICENSE)
