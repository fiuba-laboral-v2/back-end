import { Environment } from "../Environment";

const FIUBAUsersConfigForAllEnvironments: IFIUBAUsersConfig = {
  production: {
    url: "https://services.fi.uba.ar/usuarios.php"
  },
  staging: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php"
  },
  development: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php"
  },
  test_travis: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php"
  },
  test: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php"
  }
};

const FIUBAUsersConfig = FIUBAUsersConfigForAllEnvironments[Environment.NODE_ENV];

interface IEnvironment {
  url: string;
}

interface IFIUBAUsersConfig {
  production: IEnvironment;
  staging: IEnvironment;
  development: IEnvironment;
  test: IEnvironment;
  test_travis: IEnvironment;
}

export { FIUBAUsersConfig };
