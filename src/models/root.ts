import { Sequelize, DataTypes } from "sequelize";

export interface RootsAttributes {
  title?: string;
}

export interface RootsInstance {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
}

export default (sequelize: Sequelize, dataTypes: DataTypes) => {
  const Roots = sequelize.define("Roots", {
    title: dataTypes.STRING
  });
  Roots.associate = models => {
    // associations can be defined here
  };
  return Roots;
};
