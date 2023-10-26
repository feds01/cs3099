import { jest } from '@jest/globals';

/** Simple mock to override logging service calls */
const Logger = {
    info: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
};

export default Logger;
