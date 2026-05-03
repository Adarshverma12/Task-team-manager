const express = require('express');
const {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
