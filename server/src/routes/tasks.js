const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, getTask, createTask, updateTask, deleteTask, getTasksByProject,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();
router.use(protect);

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 150 }),
  body('project').notEmpty().withMessage('Project ID is required').isMongoId(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'inprogress', 'done']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

router.get('/',                          getTasks);
router.post('/', authorize('admin'),     taskValidation, createTask);
router.get('/project/:projectId',        getTasksByProject);
router.get('/:id',                       getTask);
router.put('/:id',                       updateTask);   // members can update status
router.delete('/:id', authorize('admin'), deleteTask);

module.exports = router;
