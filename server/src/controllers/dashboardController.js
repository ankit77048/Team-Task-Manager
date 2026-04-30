const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard overview stats
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;
    const now = new Date();

    let taskFilter = isAdmin ? {} : { assignee: userId };

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      totalProjects,
      recentTasks,
      overdueTaskList,
    ] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'todo' }),
      Task.countDocuments({ ...taskFilter, status: 'inprogress' }),
      Task.countDocuments({ ...taskFilter, status: 'done' }),
      Task.countDocuments({ ...taskFilter, status: { $ne: 'done' }, dueDate: { $lt: now } }),
      isAdmin
        ? Project.countDocuments()
        : Project.countDocuments({ $or: [{ owner: userId }, { members: userId }] }),
      Task.find(taskFilter)
        .populate('assignee', 'name avatar')
        .populate('project', 'title color')
        .sort({ updatedAt: -1 })
        .limit(5),
      Task.find({ ...taskFilter, status: { $ne: 'done' }, dueDate: { $lt: now } })
        .populate('assignee', 'name avatar')
        .populate('project', 'title color')
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    // Project progress (admin: all; member: own)
    const projectFilter = isAdmin ? {} : { $or: [{ owner: userId }, { members: userId }] };
    const projects = await Project.find(projectFilter).select('title color status deadline').limit(8);

    const projectProgress = await Promise.all(
      projects.map(async (p) => {
        const [total, done] = await Promise.all([
          Task.countDocuments({ project: p._id }),
          Task.countDocuments({ project: p._id, status: 'done' }),
        ]);
        return {
          _id: p._id,
          title: p.title,
          color: p.color,
          status: p.status,
          deadline: p.deadline,
          total,
          done,
          progress: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      })
    );

    // Team performance (admin only)
    let teamStats = [];
    if (isAdmin) {
      const members = await User.find({ isActive: true }).select('name email avatar role').limit(10);
      teamStats = await Promise.all(
        members.map(async (member) => {
          const [assigned, completed] = await Promise.all([
            Task.countDocuments({ assignee: member._id }),
            Task.countDocuments({ assignee: member._id, status: 'done' }),
          ]);
          return {
            _id: member._id,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
            role: member.role,
            assigned,
            completed,
            completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
          };
        })
      );
    }

    res.status(200).json({
      success: true,
      stats: { totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, totalProjects },
      recentTasks,
      overdueTaskList,
      projectProgress,
      teamStats,
    });
  } catch (error) {
    next(error);
  }
};
