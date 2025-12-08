const db = require('../models');

const getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await db.Workspace.findAll({
      order: [['name', 'ASC']]
    });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
};

module.exports = {
  getAllWorkspaces
};

