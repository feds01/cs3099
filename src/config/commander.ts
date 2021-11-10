import commander, { Command } from 'commander';

/**
 * Wrapper for commander to use when parsing integer type arguments.
 *
 * @param value - A string value representing an integer
 * @returns The integer value or throws @see{InvalidArgumentError} which is a provided
 * error by commander.
 */
function parseIntWrapper(value: string) {
    const parsedValue = parseInt(value, 10); // parseInt takes a string and a radix

    if (Number.isNaN(parsedValue)) {
        throw new commander.InvalidArgumentError('Not a number.');
    }

    return parsedValue;
}

// Setup argument parsing
const program = new Command();

program.option('-p, --port <number>', 'port number', parseIntWrapper);

export default program;
