'use strict';
module.exports = (sequelize, DataTypes) => {
  const Root = sequelize.define('Root', {
    title: DataTypes.STRING
  }, {});
  Root.associate = function(models) {
    // associations can be defined here
  };
  return Root;
};