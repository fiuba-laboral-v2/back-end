"use strict";

import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || process.env.DEVELOPMENT;
import databaseJSON from "../../config/database.json";


class Model {
  public model = {} as any;
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
        this.model[model.name] = model;
      });

    Object.keys(this.model).forEach(modelName => {
      if (this.model[modelName].associate) {
        this.model[modelName].associate(this.model);
      }
    });
    this.model.sequelize = sequelize;
    this.model.Sequelize = Sequelize;
  }
}

export default new Model();
