
import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  verbose: false,
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!react-markdown/)'
  ],
  moduleNameMapper: {
    "react-markdown": "<rootDir>/src/__mocks__/react-markdown.js"
  },
}
export default config
