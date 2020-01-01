'use strict';
module.exports = (sequelize, DataTypes) => {
  const Roots = sequelize.define('Roots', {
    title: DataTypes.STRING
  }, {});
  Roots.associate = function(models) {
    // associations can be defined here
  };
  return Roots;
};
