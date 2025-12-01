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
  };

  return Article;
};

