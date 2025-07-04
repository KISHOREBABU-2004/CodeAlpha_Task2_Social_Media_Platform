module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {});

  Like.associate = (models) => {
    Like.belongsTo(models.User, { foreignKey: 'userId' });
    Like.belongsTo(models.Post, { foreignKey: 'postId' });
  };

  return Like;
};