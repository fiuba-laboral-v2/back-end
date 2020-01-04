import { Sequelize } from "sequelize-typescript";
import Environment from "../config/environment/environment";
const env = Environment.NODE_ENV;
import databaseJSON from "../../config/database.json";
import Roots from "../roots/roots";


export default class Database {
  public static sequelize: Sequelize;

  public static close() {
    this.sequelize.close();
  }

  public static setConnection() {
    const config = databaseJSON[env];
    if (config.use_env_variable) {
      this.sequelize = new Sequelize(Environment.DATABASE_URL, config);
    } else {
      this.sequelize = new Sequelize(config.database, config.username, config.password, config);
    }
    this.sequelize.addModels([Roots]);
  }
}
