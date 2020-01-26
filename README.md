# Back-end Bolsa de Trabajo de la FIUBA v2
Trabajo Práctico Profesional, FIUBA, 2020

**Staging:** [![Build Status](https://travis-ci.com/fiuba-laboral-v2/back-end.svg?branch=staging)](https://travis-ci.com/fiuba-laboral-v2/back-end)  
**Coverage** [![Coverage Status](https://coveralls.io/repos/github/fiuba-laboral-v2/back-end/badge.svg)](https://coveralls.io/github/fiuba-laboral-v2/back-end)

# Staging

http://antiguos.fi.uba.ar/graphql/

# Set up

- See [wiki](https://github.com/fiuba-laboral-v2/back-end/wiki/Set-up)

# Get started

```
    yarn install
```

## Migrations

### Development

 - `yarn db:migrate`: Runs the migrations
 - `yarn db:create`: Creates the database
 - `yarn db:drop`: Drops the database

### Test

To run test db migrations, you can use the following commands:
 
 - `yarn db:test:migrate`
 - `yarn db:test:migrate`
 - `yarn db:test:migrate`

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.<br />
Open [http://localhost:5006](http://localhost:5006) to view it in the browser.

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
