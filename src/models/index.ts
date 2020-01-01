"use strict";

import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || process.env.DEVELOPMENT;
import databaseJSON from "../../config/database.json";


class Model {
  public db = {} as any;

  public close() {
    this.db.sequelize.close();
  }

  public set() {
    const config = databaseJSON[env];

    let sequelize: Sequelize;

    if (config.USE_ENV_VARIABLE) {
      sequelize = new Sequelize(process.env.DATABASE_URL, config);
    } else {
      sequelize = new Sequelize(config.database, config.username, config.password, config);
    }

    fs
      .readdirSync(__dirname)
      .filter(file => {
        return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
      })
      .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        this.db[model.name] = model;
      });

    Object.keys(this.db).forEach(modelName => {
      if (this.db[modelName].associate) {
        this.db[modelName].associate(this.db);
      }
    });
    this.db.sequelize = sequelize;
    this.db.Sequelize = Sequelize;
  }
}

export default new Model();
