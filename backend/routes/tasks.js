const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTaskById);

router.post(
  '/',
  admin,
  [
    body('title', 'Task title is required').notEmpty().trim(),
    body('project', 'Project is required').notEmpty(),
  ],
  createTask
);

router.put('/:id', admin, updateTask);
router.put('/:id/status', updateTaskStatus);
router.delete('/:id', admin, deleteTask);

module.exports = router;
