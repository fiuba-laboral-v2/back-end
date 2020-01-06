# Back-end Bolsa de Trabajo de la FIUBA v2
Trabajo Práctico Profesional, FIUBA, 2020

[![Build Status](https://travis-ci.com/fiuba-laboral-v2/back-end.svg?branch=master)](https://travis-ci.com/fiuba-laboral-v2/back-end)

# Set up

- See [wiki](https://github.com/fiuba-laboral-v2/back-end/wiki/Set-up)

# Get started

```bash
    yarn install
```

## Migrations

### Development

 - `yarn db:test:migrate`: Runs the migrations
 - `yarn db:test:create`: Creates the database
 - `yarn db:test:drop`: Drop the database


### Test

To run test db migrations, you can use the following commands:
 
 - `yarn db:test:migrate`
 - `yarn db:test:migrate`
 - `yarn db:test:migrate`

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.<br />
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### Linter

```
    yarn lint
```

### Test
```
    yarn test
```

### Build
```
    yarn build
```

Builds the app for production to the `dist` folder.<br />
Then run it with `yarn start`
