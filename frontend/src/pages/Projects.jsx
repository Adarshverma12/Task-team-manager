import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/projects', formData);
      setProjects([response.data, ...projects]);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      toast.success('Project created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete all associated tasks.')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your team projects</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <PlusIcon />
            <span className="ml-2">New Project</span>
          </button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project._id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <Link to={`/projects/${project._id}`} className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                    {project.name}
                  </h3>
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {project.members?.length || 0} members
                </span>
                <span className="text-gray-500">
                  {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="mt-3">
                <StatusBadge status={project.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FolderIcon />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No projects</h3>
          <p className="mt-2 text-gray-500">
            {isAdmin
              ? 'Get started by creating a new project.'
              : 'No projects have been assigned to you yet.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary mt-4"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label htmlFor="description" className="label">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Enter project description"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${styles[status]}`}>
      {status}
    </span>
  );
};

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const FolderIcon = () => (
  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

export default Projects;
