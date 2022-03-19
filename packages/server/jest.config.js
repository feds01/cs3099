/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
    collectCoverageFrom: [
        '**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/frontend/**',
    ],
    modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/frontend'],

    preset: 'ts-jest',
    testEnvironment: 'node',

    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: ['./jest.setup.js', '<rootDir>/__tests__/utils/setupDB.ts'],

    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/frontend/',

        // Here we ignore utilities because it just contains utility functions for testing the app
        '<rootDir>/__tests__/utils',
    ],
};
