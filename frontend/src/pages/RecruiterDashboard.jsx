import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  console.log(user);

  // Dummy data for recruiter dashboard
  const stats = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: 'Active Job Postings',
      value: '12',
      change: '+3 this week',
      color: 'bg-blue-500',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Total Applicants',
      value: '156',
      change: '+24 new applicants',
      color: 'bg-green-500',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      label: 'Interviews Scheduled',
      value: '8',
      change: '+2 this week',
      color: 'bg-purple-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Hire Rate',
      value: '68%',
      change: '+5% from last month',
      color: 'bg-orange-500',
    },
  ];

  const recentJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      status: 'Active',
      applicants: 24,
      views: 156,
      posted: '2 days ago',
      budget: '$8,000 - $12,000',
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'Design Studio',
      status: 'Active',
      applicants: 18,
      views: 98,
      posted: '5 days ago',
      budget: '$5,000 - $8,000',
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      status: 'Closed',
      applicants: 45,
      views: 234,
      posted: '2 weeks ago',
      budget: '$10,000 - $15,000',
    },
    {
      id: 4,
      title: 'Product Manager',
      company: 'Innovation Labs',
      status: 'Active',
      applicants: 12,
      views: 67,
      posted: '1 week ago',
      budget: '$12,000 - $18,000',
    },
  ];

  const recentApplicants = [
    {
      id: 1,
      name: 'John Doe',
      position: 'Senior Frontend Developer',
      status: 'Under Review',
      appliedDate: '2 days ago',
      experience: '5 years',
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'UI/UX Designer',
      status: 'Interview Scheduled',
      appliedDate: '3 days ago',
      experience: '4 years',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'Full Stack Developer',
      status: 'Shortlisted',
      appliedDate: '5 days ago',
      experience: '6 years',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Closed':
        return 'bg-gray-100 text-gray-700';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700';
      case 'Interview Scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'Shortlisted':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'Closed':
        return <XCircle className="w-4 h-4" />;
      case 'Under Review':
        return <Clock className="w-4 h-4" />;
      case 'Interview Scheduled':
        return <MessageSquare className="w-4 h-4" />;
      case 'Shortlisted':
        return <FileText className="w-4 h-4" />;
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
            Welcome back, {user?.name || 'Recruiter'}! 👋
          </h1>
          <p className="text-gray-600">Manage your job postings and find the best talent.</p>
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
              <h2 className="text-2xl font-bold mb-2">Ready to post a new job?</h2>
              <p className="text-primary-100">Find the perfect candidate for your team!</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/post-job"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </Link>
              <Link
                to="/applicants"
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                View Applicants
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Job Postings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Job Postings</h2>
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Applicants</div>
                      <div className="text-sm font-semibold text-gray-900">{job.applicants}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Views</div>
                      <div className="text-sm font-semibold text-gray-900">{job.views}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">Budget</div>
                      <div className="text-sm font-semibold text-gray-900">{job.budget}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Posted</div>
                      <div className="text-sm text-gray-600">{job.posted}</div>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Applicants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Applicants</h2>
              <Link to="/applicants" className="text-primary-600 hover:text-primary-700 font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentApplicants.map((applicant, index) => (
                <motion.div
                  key={applicant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{applicant.name}</h3>
                      <p className="text-sm text-gray-600">{applicant.position}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                      {getStatusIcon(applicant.status)}
                      {applicant.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="text-sm font-semibold text-gray-900">{applicant.experience}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Applied</div>
                      <div className="text-sm text-gray-600">{applicant.appliedDate}</div>
                    </div>
                    <Link
                      to={`/applicants/${applicant.id}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;

