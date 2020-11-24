import { Dialect } from "sequelize";

export const PostgresConfig = {
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres"
  },
  staging: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres"
  },
  development: {
    username: "postgres",
    password: "postgres",
    database: "development",
    host: "localhost",
    port: 5434,
    dialect: "postgres",
    use_env_variable: undefined
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "test",
    host: "localhost",
    port: 5434,
    dialect: "postgres",
    logging: false,
    use_env_variable: undefined
  }
};

interface IEnvironmentPostgresConfig {
  use_env_variable: string;
  dialect: Dialect;
}

interface ILocalPostgresConfig {
  use_env_variable: undefined;
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  logging: boolean;
}

export type TPostgresConfig = IEnvironmentPostgresConfig | ILocalPostgresConfig;
