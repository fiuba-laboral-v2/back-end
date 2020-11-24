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
    dialect: "postgres"
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "test",
    host: "localhost",
    port: 5434,
    dialect: "postgres",
    logging: false
  }
};
