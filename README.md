# Bolsa de Trabajo FIUBA: back-end

Trabajo Práctico Profesional, FIUBA, 2020

**Staging:**

- **Build:** ![Build status](https://github.com/fiuba-laboral-v2/back-end/workflows/back-end-build/badge.svg)
- **Coverage:** [![Coverage Status](https://coveralls.io/repos/github/fiuba-laboral-v2/back-end/badge.svg)](https://coveralls.io/github/fiuba-laboral-v2/back-end)
- **URL:** http://antiguos.fi.uba.ar/graphql/

## Set up

- Ver [wiki](https://github.com/fiuba-laboral-v2/back-end/wiki/Set-up)

## Comandos de yarn

En este repositorio se usa `yarn` como gestor de dependencias

- `yarn install`: Este comando instala las dependencias especificadas en el
  archivo `package.json`.

- `yarn db:create`: Este comando crea la base de datos para el ambiente
  especificado en `NODE_ENV` (Por defecto es development).

- `yarn db:drop`: Este comando elimina la base de datos para el ambiente
  especificado en `NODE_ENV` (Por defecto es development).

- `yarn db:migrate`: Este comando corre las migraciones de la base de datos
  para el ambiente especificado en `NODE_ENV` (Por defecto es development).

- `yarn db:test:create`: Este comando crea la base de datos para el ambiente
  de test.

- `yarn db:test:drop`: Este comando elimina la base de datos para el ambiente
  de test.

- `yarn db:test:migrate`: Este comando corre las migraciones de la base de
  datos para el ambiente de test.

- `yarn dev`: Este comando ejecuta el servidor utilizando `nodemon` para que
  se recompile en caso de que se detecte un cambio. Se usa para desarrollo.

- `yarn build`: Este comando compila los archivos de Typescript a Javascript
  en la carpeta `dist`.

- `yarn build-migrations`: Este comando compila las migraciones de Typescript
  a Javascript en la carpeta `dist_migrations`.

- `yarn build-seeders`: Este comando compila los seeders de Typescript a
  Javascript en la carpeta `dist_seeders`.

- `yarn test`: Este comando ejecuta los tests.

- `yarn lint`: Este comando ejecuta todos los linters que están integrados,
  es decir, ejecuta `prettier`, `tslint` y `tsc` que es el compilador. En caso
  de que falle el linter debido a `prettier`, se debe ejecutar `format:all` para
  arreglarlo.

- `yarn format:all`: Este comando arregla los errores del linter de `prettier`.

- `yarn db:reboot`: Este comando borra la base de datos para el ambiente
  especificado en `NODE_ENV`, luego la crea, corre las migraciones y ejecuta
  los seeders de development. Tener en cuenta que este comando se usa solo para
  desarrollo y no debería ser necesario ejecutarlo en producción.

- `yarn db:all:reboot`: Este comando borra la base de datos para el
  ambiente especificado en `NODE_ENV` y para el ambiente de test, luego la crea,
  corre las migraciones y ejecuta los seeders de development. Tener en cuenta
  que este comando se usa solo para desarrollo y no debería ser necesario
  ejecutarlo en producción.

- `yarn db:seed:all:development`: Este comando borra todos los datos de la
  base de datos y ejecuta los seeders de nuevo. Si el ambiente es productivo,
  estos seeders no se ejecutan.

- `yarn db:seed:all:production`: Este comando borra todos los datos de la
  base de datos y ejecuta los seeders de nuevo. Si el ambiente no es productivo,
  estos seeders no se ejecutan.

- `yarn db:seed:up:production`: Este comando recibe el nombre de un
  archivo de un seeder de producción con extensión en `js` y ejecuta el método
  `up` del mismo.
  ej: `yarn db:seed:up:production 20210112200842-add-shared-settings.ts`

- `yarn db:seed:down:production`: Este comando recibe el nombre de un
  archivo de un seeder de producción con extensión en `js` y ejecuta el
  método `down` del mismo.
  ej: `yarn db:seed:down:production 20210112200842-add-shared-settings.ts`

- `yarn stash`: Este comando utiliza el stash de git para ocultar los archivos
  que no están agregados para el commit. Se usa al momento de querer realizar un commit cuando
  tenemos archivos nuevos sin agregar.
  `yarn unstash`: Este comando saca de la pila del stash de git los últimos
  archivos del stash.
