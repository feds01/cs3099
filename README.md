# Iamus sources

This repository holds the sources to the Iamus journal platform (CS3099 project). The sources
currently contain the code for the Node.js/Express.js backend and the React.js frontend.

Sources for the backend are located in `src/` and sources for the frontend code is located
in the `frontend/` folder.

## Commands

-   `npm run build`: Compile Typescript files.
-   `npm run clean`: Remove all build artifacts.
-   `npm run start`: Run the server (you must have run `npm run build` prior to this).
-   `npm run test`: Run the test suite.
-   `npm run fmt`: Format all Typescript files.
-   `npm run lint`: Run ESLint on all Typescript files.
-   `npm run tcheck`: Type-check all Typescript files but do not emit any JavaScript.
-   `npm run dev`: Run server in development mode (listen for changes and re-compile).
