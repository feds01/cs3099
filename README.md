# Iamus sources

This repository holds the sources to the Iamus journal platform (CS3099 project). The sources
currently contain the code for the Node.js/Express.js backend and the React.js frontend.

Sources for the backend are located in `src/` and sources for the frontend code is located
in the `frontend/` folder.

## Installation

To install the project, you need to run the following command:

```sh
yarn install && cd frontend/ && yarn install
```

This will install the dependencies for both the backend sources and frontend sources.
Once everything is installed, you can run the application in either production or development
mode by the described commands below.

## Commands

-   `yarn run build`: Compile Typescript files.
-   `yarn run clean`: Remove all build artifacts.
-   `yarn run start`: Run the server (you must have run `npm run build` prior to this).
-   `yarn run test`: Run the test suite.
-   `yarn run fmt`: Format all Typescript files.
-   `yarn run lint`: Run ESLint on all Typescript files.
-   `yarn run tcheck`: Type-check all Typescript files but do not emit any JavaScript.
-   `yarn run dev`: Run server in development mode (listen for changes and re-compile).
