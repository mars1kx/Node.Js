module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'workspaces',
        key: 'id'
      }
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    originalArticleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'articles',
        key: 'id'
      }
    },
    isLatest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'articles',
    timestamps: true
  });

  Article.associate = (models) => {
    Article.belongsTo(models.Workspace, {
      foreignKey: 'workspaceId',
      as: 'workspace'
    });
    Article.hasMany(models.Comment, {
      foreignKey: 'articleId',
      as: 'comments'
    });
    Article.belongsTo(models.Article, {
      foreignKey: 'originalArticleId',
      as: 'originalArticle'
    });
    Article.hasMany(models.Article, {
      foreignKey: 'originalArticleId',
      as: 'versions'
    });
    Article.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author'
    });
  };

  return Article;
};

