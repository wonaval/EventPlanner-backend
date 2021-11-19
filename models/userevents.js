'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userEvents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  userEvents.init({
    userId: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    },
    eventId: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    }
  }, {
    sequelize,
    modelName: 'userEvents',
  });
  return userEvents;
};