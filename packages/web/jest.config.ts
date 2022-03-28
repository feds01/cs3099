import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/lib/api/**/*.ts',
    '!src/lib/prismjs/*.js',
    '!src/worker/*.ts',
    '!src/reportWebVitals.ts',
    '!src/setupProxy.js',
  ],
  setupFiles: [
    '<rootDir>/node_modules/react-app-polyfill/jsdom.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.tsx'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$':
      '<rootDir>/node_modules/react-scripts/config/jest/babelTransform.js',
    '^.+\\.css$':
      '<rootDir>/node_modules/react-scripts/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)':
      '<rootDir>/node_modules/react-scripts/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  moduleNameMapper: { '^react-native$': 'react-native-web', '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy' },
  moduleFileExtensions: ['web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx', 'node'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  resetMocks: true,
  rootDir: '.',
};

export default config;
