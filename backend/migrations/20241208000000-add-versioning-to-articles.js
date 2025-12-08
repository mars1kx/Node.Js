'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('articles', 'version', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.addColumn('articles', 'originalArticleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'articles',
        key: 'id'
      }
    });

    await queryInterface.addColumn('articles', 'isLatest', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.addIndex('articles', ['originalArticleId']);
    await queryInterface.addIndex('articles', ['isLatest']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('articles', ['isLatest']);
    await queryInterface.removeIndex('articles', ['originalArticleId']);
    await queryInterface.removeColumn('articles', 'isLatest');
    await queryInterface.removeColumn('articles', 'originalArticleId');
    await queryInterface.removeColumn('articles', 'version');
  }
};

