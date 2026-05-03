const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post(
  '/',
  admin,
  [body('name', 'Project name is required').notEmpty().trim()],
  createProject
);

router.put('/:id', admin, updateProject);
router.delete('/:id', admin, deleteProject);

router.post('/:id/members', admin, addMember);
router.delete('/:id/members/:userId', admin, removeMember);

module.exports = router;
