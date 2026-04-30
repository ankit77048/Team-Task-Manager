const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();
router.use(protect);

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('deadline').optional().isISO8601().withMessage('Invalid date format'),
];

router.get('/',                        getProjects);
router.post('/',   authorize('admin'), projectValidation, createProject);
router.get('/:id',                     getProject);
router.put('/:id', authorize('admin'), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);
router.post('/:id/members',            authorize('admin'), addMember);
router.delete('/:id/members/:userId',  authorize('admin'), removeMember);

module.exports = router;
