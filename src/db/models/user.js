'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    role: {
      type: DataTypes.INTEGER,
      defaultValue: this.STANDARD
    }
  }, {});

  User.STANDARD = 0;
  User.PREMIUM = 1;
  User.ADMIN = 2;

  User.associate = function (models) {
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "wikis"
    });
  };
  
  User.prototype.isAdmin = function () {
    //return this.role === "admin";
    return true;
  };

  return User;
};