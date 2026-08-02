# ![spin](https://i.ibb.co/4M0J13j/spin.png) Spinnies ![spin](https://i.ibb.co/4M0J13j/spin.png)
> Node.js module to create and manage multiple spinners in command-line interface programs

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

spinnies.destroy();
```

## API

This library follows a **non-error-throwing** philosophy. If you provide an invalid option or an invalid value for a valid option *it will be ignored*.

### Initialization:

#### new Spinnies([options])

Parameters
- **options** - `object`:
  - **color** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors). The default value is `white`.
  - **succeedColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors). The default value is `green`.
  - **failColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors). The default value is `red`.
  - **spinnerColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors). The default value is `greenBright`.
  - **succeedPrefix** - `string`: The default value is ✓.
  - **failPrefix**- `string`: The default value is ✖.
  - **spinner**- `object`:
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
  - **indent**: - `number`: Optional, indent the spinner with the given number of spaces.
  - **status** - `string`: Initial status of the spinner. Valid statuses are: `succeed`, `fail`, `spinning`, `non-spinnable`and `stopped`.
  - **color** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).
  - **succeedColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).
  - **failColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).

Return value: Returns the spinner's options.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('spinner-1');
spinnies.add('another-spinner', { text: 'Hello, I am a spinner!', color: 'greenBright' });

```

#### pick(name)
Picks a spinner.

Parameters:
- **name** - `string`: spinner reference name.

Return value: Returns the spinner's options.

#### remove(name)
Removes a spinner.

Parameters:
- **name** - `string`: spinner reference name.

#### update(name, [options])

Updates the spinner with name `name` with the provided options.

Parameters:
- **name** - `string`: spinner reference name.
- **options** - `object`:
  - **text**: - `string`: Optional text to show in the spinner. If none is provided, the `name` field will be shown.
  - **status** - `string`: New status of the spinner. Valid statuses are: `succeed`, `fail`, `spinning`, `non-spinnable`and `stopped`.
  - **color** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).
  - **succeedColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).
  - **failColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).

Return value: Returns the spinner's options.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
// some code
spinnies.update('spinner-1', { text: 'Hello, I am an updated text!', color: 'blue' });

```

#### succeed(name, [options])

Sets the specified spinner status as `succeed`.

Parameters:
- **name** - `string`: spinner reference name.
- **options** - `object`:
  - **text**: - `string`: Optional text to show in the spinner. If none is provided, the `name` field will be shown.
  - **succeedColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).

Return value: Returns the spinner's options.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
// some code
spinnies.succeed('spinner-1', { text: 'Success!', successColor: 'greenBright' });

```

#### fail(name, [options])

Sets the specified spinner status as `fail`.

Parameters:
- **name** - `string`: spinner reference name.
- **options** - `object`:
  - **text**: - `string`: Optional text to show in the spinner. If none is provided, the `name` field will be shown.
  - **failColor** - `string`: Any valid [yoctocolors color](https://github.com/sindresorhus/yoctocolors/#colors).

Return value: Returns the spinner's options.

Example:

```js
const spinnies = new Spinnies();
spinnies.add('spinner-1', { text: 'Hello! I am the initial text', color: 'green' });
// some code
spinnies.fail('spinner-1', { text: 'I failed', failColor: 'redBright' });

```

#### stopAll([status])

Stops the spinners and sets the non-succeeded and non-failed ones to the provided status, which can be `succeed`, `fail` or `stopped`. You can see an example [here](https://github.com/jcarpanelli/spinnies/blob/master/examples/demo-stop-all.js).

#### destroy()

Proper cleanup when the instance is no longer needed: stops the render interval, restores the cursor and releases the process listener. Safe to call more than once.

Spinnies does not intercept `SIGINT`/`SIGTERM`, so your application keeps full control of its own shutdown. The cursor is still restored on exit.

#### hasActiveSpinners()
Return value: returns `false` if all spinners have succeeded, failed or have been stopped.

## Contribute

Star it, fork it, improve it, PR it! :raised_hands:.

## License

[MIT](https://github.com/jcarpanelli/spinnies/blob/master/LICENSE)
