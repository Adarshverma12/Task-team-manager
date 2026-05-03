import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });
  const [selectedMember, setSelectedMember] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);

      if (isAdmin) {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
      }
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/tasks', {
        ...taskForm,
        project: id,
        assignedTo: taskForm.assignedTo || undefined,
        dueDate: taskForm.dueDate || undefined,
      });
      setTasks([response.data, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
      });
      toast.success('Task created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.error('Please select a member');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/projects/${id}/members`, {
        userId: selectedMember,
      });
      setProject(response.data);
      setShowMemberModal(false);
      setSelectedMember('');
      toast.success('Member added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      const response = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(response.data);
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status });
      setTasks(tasks.map((t) => (t._id === taskId ? response.data : t)));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) return null;

  const availableUsers = users.filter(
    (u) => !project.members?.some((m) => m._id === u._id) && u._id !== project.owner?._id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <BackIcon /> Back to projects
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-gray-600">{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary">
              Add Member
            </button>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
              Add Task
            </button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
        <div className="flex flex-wrap gap-3">
          <MemberBadge user={project.owner} role="Owner" />
          {project.members?.map((member) => (
            <MemberBadge
              key={member._id}
              user={member}
              onRemove={isAdmin ? () => handleRemoveMember(member._id) : undefined}
            />
          ))}
          {!project.members?.length && (
            <p className="text-sm text-gray-500">No additional members</p>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        </div>
        {tasks.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-500 truncate">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                      {task.assignedTo && (
                        <span>Assigned to: {task.assignedTo.name}</span>
                      )}
                      {task.dueDate && (
                        <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      )}
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No tasks yet</p>
            {isAdmin && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
              >
                Create the first task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="input"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Task description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Due Date (optional)</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Assign To (optional)</label>
            <select
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              className="input"
            >
              <option value="">Unassigned</option>
              <option value={project.owner._id}>{project.owner.name} (Owner)</option>
              {project.members?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="label">Select User</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="input"
            >
              <option value="">Select a user</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {availableUsers.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">No available users to add</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !selectedMember} className="btn btn-primary">
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const MemberBadge = ({ user, role, onRemove }) => (
  <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-1 pr-3 py-1">
    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
      <span className="text-xs font-medium text-primary-600">
        {user?.name?.charAt(0).toUpperCase()}
      </span>
    </div>
    <span className="text-sm text-gray-700">{user?.name}</span>
    {role && <span className="text-xs text-primary-600">({role})</span>}
    {onRemove && (
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 ml-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };

  return <span className={`capitalize ${styles[priority]}`}>{priority} priority</span>;
};

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default ProjectDetail;
