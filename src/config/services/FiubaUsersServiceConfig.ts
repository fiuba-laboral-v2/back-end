import { Environment } from "../Environment";

export const FiubaUsersServiceConfig: IFiubaUsersServiceConfig = {
  production: {
    url: "https://services.fi.uba.ar/usuarios.php",
  },
  staging: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php",
  },
  development: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php",
  },
  test_travis: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php",
  },
  test: {
    url: "http://services.desarrollo.fi.uba.ar/usuarios.php",
  },
}[Environment.NODE_ENV];

interface IFiubaUsersServiceConfig {
  url: string;
}
