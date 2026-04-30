const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats (tasks assigned, completed, etc.)
// @route   GET /api/users/:id/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [totalTasks, doneTasks, inProgressTasks, overdueTasks, projectCount] = await Promise.all([
      Task.countDocuments({ assignee: userId }),
      Task.countDocuments({ assignee: userId, status: 'done' }),
      Task.countDocuments({ assignee: userId, status: 'inprogress' }),
      Task.countDocuments({ assignee: userId, status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
      Project.countDocuments({ members: userId }),
    ]);
    res.status(200).json({
      success: true,
      stats: { totalTasks, doneTasks, inProgressTasks, overdueTasks, projectCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deactivateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
