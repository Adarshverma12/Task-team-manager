import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks'),
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! {isAdmin ? "(Admin)" : "(Member)"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          color="primary"
          icon={<TaskIcon />}
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          color="green"
          icon={<CheckIcon />}
        />
        <StatCard
          title="Pending"
          value={stats.pendingTasks}
          color="yellow"
          icon={<ClockIcon />}
        />
        <StatCard
          title="Overdue"
          value={stats.overdueTasks}
          color="red"
          icon={<AlertIcon />}
        />
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        {recentTasks.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentTasks.map((task) => (
              <li key={task._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {task.project?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        Due: {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No tasks yet</p>
            {isAdmin && (
              <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Create a project to get started
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  const labels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// Icons
const TaskIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default Dashboard;
