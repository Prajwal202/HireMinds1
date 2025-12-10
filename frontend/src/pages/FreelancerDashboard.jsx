import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  console.log(user);
  // Dummy data for freelancer dashboard
  const stats = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: 'Active Projects',
      value: '8',
      change: '+2 this week',
      color: 'bg-blue-500',
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: 'Total Earnings',
      value: '$12,450',
      change: '+$1,200 this month',
      color: 'bg-green-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Success Rate',
      value: '94%',
      change: '+3% from last month',
      color: 'bg-purple-500',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Total Clients',
      value: '24',
      change: '+4 new clients',
      color: 'bg-orange-500',
    },
  ];

  const recentJobs = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      client: 'TechCorp Inc.',
      status: 'In Progress',
      budget: '$5,000',
      deadline: '15 days left',
      progress: 65,
    },
    {
      id: 2,
      title: 'Mobile App UI Design',
      client: 'StartupXYZ',
      status: 'In Progress',
      budget: '$2,500',
      deadline: '8 days left',
      progress: 80,
    },
    {
      id: 3,
      title: 'Data Analysis Project',
      client: 'Analytics Co.',
      status: 'Completed',
      budget: '$3,200',
      deadline: 'Completed',
      progress: 100,
    },
    {
      id: 4,
      title: 'WordPress Blog Setup',
      client: 'BlogMaster',
      status: 'Pending',
      budget: '$800',
      deadline: '20 days left',
      progress: 0,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Freelancer'}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-xs text-green-600 font-medium">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-xl shadow-lg p-6 mb-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Ready for your next project?</h2>
              <p className="text-primary-100">Browse available jobs and start earning today!</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/jobs"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Browse Jobs
              </Link>
              <Link
                to="/profile"
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-sm text-gray-600">Client: {job.client}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {job.status}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {job.status === 'In Progress' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 md:ml-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Budget</div>
                      <div className="text-lg font-bold text-gray-900">{job.budget}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Deadline</div>
                      <div className="text-sm font-semibold text-gray-900">{job.deadline}</div>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;

