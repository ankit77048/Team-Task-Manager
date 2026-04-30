const Project = require('../models/Project');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query;
    // Admins see all projects; members see only projects they belong to
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] });
    }

    const projects = await query
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    // Attach task counts to each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const [total, done] = await Promise.all([
          Task.countDocuments({ project: project._id }),
          Task.countDocuments({ project: project._id, status: 'done' }),
        ]);
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...project.toObject(), taskCount: total, completedCount: done, progress };
      })
    );

    res.status(200).json({ success: true, count: projectsWithStats.length, projects: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Check access for members
    if (req.user.role !== 'admin') {
      const isMember =
        project.owner._id.toString() === req.user.id ||
        project.members.some((m) => m._id.toString() === req.user.id);
      if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [total, done, inprogress] = await Promise.all([
      Task.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id, status: 'done' }),
      Task.countDocuments({ project: project._id, status: 'inprogress' }),
    ]);

    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    res.status(200).json({
      success: true,
      project: { ...project.toObject(), taskCount: total, completedCount: done, inProgressCount: inprogress, progress },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const project = await Project.create({ ...req.body, owner: req.user.id });
    await project.populate('owner', 'name email avatar');
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const { members, ...rest } = req.body; // prevent members overwrite here
    project = await Project.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (also deletes tasks)
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project and all its tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }
    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email avatar');
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.members = project.members.filter((m) => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('members', 'name email avatar');
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};
