# Iamus Web Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Configuration 

The frontend uses environment variables to store some configuration parameters that are
environment specific. The file that is used by the server is called `.env`. It should 
be created in the root of the disk and this is the contents that should be within the 
disk:
```
# API Endpoint
REACT_APP_API_URI=
REACT_APP_SERVICE_URI=
```
**Note**: `sample.env` has an example copy of a partial configuration.


The `REACT_APP_API_URI` is the URI of the API server running. If you have a local
instance running, simply provide the URL to and set the variable to it like so:
```
REACT_APP_API_URI=http://localhost:5000
```

If the variable is not set, the web frontend will not be able to communicate with the 
backend API server.

### Additional debug info

If you are a developer and you want to distribute a packaged version of the app with 
some metadata information about the compiled version, you can use the utility 
command to append some additional information to the build using:

```
yarn run version
```

This will generate the following details in the file `.env.local` that when starting the 
server or building a production version can use to help debugging:
```
REACT_APP_NAME='Iamus'
REACT_APP_VERSION='1.0.0'
REACT_APP_VERSION_BRANCH='docs'
REACT_APP_DEV_VERSION='87496fa9b57ff8b5a9db9f7bf657e172a2411e70'
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn fmt`

Run the formatting tools on the project sources.

### `yarn serve`

Run the production version of the web frontend by specifying the port. The command should be 
invoked by presetting the `PORT` environment variable before like so:

```
PORT=3000 yarn serve
```

### `yarn serve-default`

An analogous command to `yarn serve` but always assumes that the production server should run on port
`3000`.

### `yarn tcheck`

Run static typechecking on the project to verify that the project doesn't contains any build errors
before building or running the project. This is a utility command added to save time during development.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
