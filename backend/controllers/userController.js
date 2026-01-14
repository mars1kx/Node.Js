const db = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const userId = parseInt(req.params.id);

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Valid role is required (user or admin)' });
  }

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole
};
