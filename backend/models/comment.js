module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id'
      }
    },
    originalArticleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id'
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'comments',
    timestamps: true
  });

  return Comment;
};


