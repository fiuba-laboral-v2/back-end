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

```
    NODE_ENV=<environment-name> yarn db:migrate
```

If the database does not exist, then execute:

```
    NODE_ENV=<environment-name> yarn db:create
```

To drop the database, you can execute:
```
    NODE_ENV=<environment-name> yarn db:drop
```

The environment names are:
- test
- development

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
