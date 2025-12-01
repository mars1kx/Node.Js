'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('workspaces', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Insert default workspaces
    await queryInterface.bulkInsert('workspaces', [
      {
        name: 'Personal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Work',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Projects',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('workspaces');
  }
};


