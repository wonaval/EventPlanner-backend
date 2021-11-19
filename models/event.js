'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.event.belongsTo(models.user)
    }
  };
  event.init({
    date: {
      type: DataTypes.DATE, 
      validate: {
        isDate: true,
        notEmpty: true
      }
    },
    location: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true
      }
    }
  }, {
    sequelize,
    modelName: 'event',
  });
  return event;
};