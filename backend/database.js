const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './social.db',
  logging: console.log
});

module.exports = sequelize;