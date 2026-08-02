import Spinnies from '../index.js';

const spinners = new Spinnies();

spinners.add('download', { text: 'Downloading dependencies' });
spinners.add('wrapped', {
    text: 'This spinner has a long text so it wraps onto several lines, where the cursor used to drift',
});
spinners.add('build', { text: 'Building', indent: 3 });

setTimeout(() => {
    spinners.succeed('download', { text: 'Dependencies downloaded' });
}, 2000);

setTimeout(() => {
    spinners.destroy();
    console.log('Destroyed while two spinners were still running.');
    setImmediate(() => {
        const timers = process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout');
        if (timers.length > 0) {
            console.error(`FAIL: ${timers.length} timer(s) still holding the event loop open.`);
            process.exitCode = 1;
            return;
        }

        console.log('OK: no timer left behind, the process exits on its own.');
    });
}, 4000);
