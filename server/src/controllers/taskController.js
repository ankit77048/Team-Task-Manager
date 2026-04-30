const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// @desc    Get tasks (with filters)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, assignee, status, priority, overdue } = req.query;
    let filter = {};

    // Admins can see all; members see only their assigned tasks
    if (req.user.role !== 'admin') {
      filter.assignee = req.user.id;
    }

    if (project) filter.project = project;
    if (assignee && req.user.role === 'admin') filter.assignee = assignee;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: 'done' };
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title color')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title color status');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Members can only view their own tasks
    if (req.user.role !== 'admin' && task.assignee?._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    // Ensure project exists
    const project = await Project.findById(req.body.project);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const task = await Task.create({ ...req.body, createdBy: req.user.id });
    await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'project', select: 'title color' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (admin: all fields; member: status only)
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Members can only update status of their own tasks
    if (req.user.role !== 'admin') {
      if (!task.assignee || task.assignee.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const { status } = req.body;
      if (!status) return res.status(400).json({ success: false, message: 'Members can only update task status' });
      task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true })
        .populate('assignee', 'name email avatar')
        .populate('project', 'title color');
      return res.status(200).json({ success: true, task });
    }

    // Admin: update all fields
    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title color');

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a specific project (used in kanban board)
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};
