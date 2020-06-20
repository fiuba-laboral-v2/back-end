import { Sequelize } from "sequelize-typescript";
import { Environment } from "./Environment";
import databaseJSON from "../../config/database.json";
import { models } from "../models";
import { QueryOptions } from "sequelize";

export default class Database {
  public static sequelize: Sequelize;

  public static close() {
    this.sequelize?.close();
  }

  public static transaction() {
    return this.sequelize?.transaction();
  }

  public static query(sql: string, options: QueryOptions) {
    return this.sequelize?.query(sql, options);
  }

  public static setConnection() {
    const config = databaseJSON[Environment.NODE_ENV];

    if (config.use_env_variable) {
      if (!Environment.DATABASE_URL) throw new Error("DATABASE_URL not set");
      this.sequelize = new Sequelize(Environment.DATABASE_URL, config);
    } else {
      this.sequelize = new Sequelize(config.database, config.username, config.password, config);
    }
    this.sequelize.addModels(models);
  }
}
