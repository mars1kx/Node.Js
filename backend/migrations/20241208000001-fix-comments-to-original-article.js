'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('comments', 'originalArticleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'articles',
        key: 'id'
      }
    });

    await queryInterface.sequelize.query(`
      UPDATE comments 
      SET "originalArticleId" = COALESCE(
        (SELECT "originalArticleId" FROM articles WHERE articles.id = comments."articleId"),
        comments."articleId"
      )
    `);

    await queryInterface.changeColumn('comments', 'originalArticleId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id'
      }
    });

    await queryInterface.addIndex('comments', ['originalArticleId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('comments', ['originalArticleId']);
    await queryInterface.removeColumn('comments', 'originalArticleId');
  }
};

