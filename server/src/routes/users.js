const express = require('express');
const { getAllUsers, getUserById, updateUserRole, getUserStats, deactivateUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/',              authorize('admin'), getAllUsers);
router.get('/:id',           authorize('admin'), getUserById);
router.get('/:id/stats',     getUserStats);
router.put('/:id/role',      authorize('admin'), updateUserRole);
router.delete('/:id',        authorize('admin'), deactivateUser);

module.exports = router;
