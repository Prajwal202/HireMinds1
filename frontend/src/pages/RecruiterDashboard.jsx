import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  MessageSquare,
  Edit,
  Trash2,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI, authAPI, bidAPI } from '../api';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Manual refresh function
  const refreshJobs = async () => {
    try {
      setLoading(true);
      console.log('Manual refresh: Fetching jobs from API...');
      // Try getMyJobs first, fallback to getAllJobs if it fails
      let response;
      try {
        response = await jobAPI.getMyJobs();
        console.log('Manual getMyJobs response:', response);
      } catch (myJobsError) {
        console.log('Manual getMyJobs failed, trying getAllJobs:', myJobsError);
        response = await jobAPI.getAllJobs();
        console.log('Manual getAllJobs response:', response);
        // Filter jobs by current user if we got all jobs
        if (response.success && user) {
          response.data = response.data.filter(job => 
            job.postedBy && (job.postedBy._id === user.id || job.postedBy === user.id)
          );
          console.log('Manual filtered jobs for current user:', response.data);
        }
      }
      if (response.success) {
        setJobs(response.data);
        toast.success(`Dashboard refreshed! Found ${response.data.length} jobs`);
      } else {
        toast.error('Failed to load jobs: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error refreshing jobs:', error);
      toast.error('Failed to refresh jobs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch bids for the recruiter
  const fetchBids = async () => {
    try {
      console.log('Fetching bids for recruiter...');
      const response = await bidAPI.getRecruiterBids();
      console.log('Bids response:', response);
      if (response.success) {
        setBids(response.data);
        console.log('Bids loaded:', response.data.length);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
      // Don't show error toast for bids as it's not critical
    }
  };

  // Test authentication function
  const testAuth = async () => {
    console.log('Testing authentication...');
    console.log('Current user:', user);
    console.log('Token in localStorage:', !!localStorage.getItem('token'));
    
    try {
      const response = await authAPI.getMe();
      console.log('Auth test response:', response);
      toast.success('Authentication working!');
    } catch (error) {
      console.error('Auth test failed:', error);
      toast.error('Authentication failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // Trigger refresh when navigating from PostJob with refresh state
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey(prev => prev + 1);
    }
  }, [location.state?.refresh]);

  // Fetch jobs on component mount and when location changes or refresh state is set
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        console.log('Fetching jobs from API...');
        // Try getMyJobs first, fallback to getAllJobs if it fails
        let response;
        try {
          response = await jobAPI.getMyJobs();
          console.log('getMyJobs response:', response);
        } catch (myJobsError) {
          console.log('getMyJobs failed, trying getAllJobs:', myJobsError);
          response = await jobAPI.getAllJobs();
          console.log('getAllJobs response:', response);
          // Filter jobs by current user if we got all jobs
          if (response.success && user) {
            response.data = response.data.filter(job => 
              job.postedBy && (job.postedBy._id === user.id || job.postedBy === user.id)
            );
            console.log('Filtered jobs for current user:', response.data);
          }
        }
        console.log('Final API response:', response);
        if (response.success) {
          console.log('Jobs data:', response.data);
          setJobs(response.data);
        } else {
          console.log('API response not successful:', response);
          toast.error('Failed to load jobs: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load your jobs');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log('User authenticated:', user);
      console.log('User ID:', user.id);
      console.log('User role:', user.role);
      fetchJobs();
      fetchBids(); // Also fetch bids
    } else {
      console.log('No user found, not fetching jobs');
    }
  }, [user, refreshKey]);

  // Calculate stats from actual jobs
  const stats = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: 'Total Job Postings',
      value: jobs.length.toString(),
      change: `${jobs.filter(j => j.status === 'open' || j.status === 'bidding').length} active`,
      color: 'bg-blue-500',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Open for Bidding',
      value: jobs.filter(j => {
        if (!j.biddingDeadline) return false;
        return (j.status === 'open' || j.status === 'bidding') && new Date(j.biddingDeadline) > new Date();
      }).length.toString(),
      change: 'Jobs accepting bids',
      color: 'bg-green-500',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      label: 'Closed Jobs',
      value: jobs.filter(j => j.status === 'closed' || j.status === 'cancelled').length.toString(),
      change: 'Completed or cancelled',
      color: 'bg-purple-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'This Week',
      value: jobs.filter(j => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(j.createdAt) > weekAgo;
      }).length.toString(),
      change: 'New postings',
      color: 'bg-orange-500',
    },
  ];

  // Handle delete job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await jobAPI.deleteJob(jobId);
      if (response.success) {
        toast.success('Job deleted successfully');
        setJobs(jobs.filter(j => j._id !== jobId));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete job';
      toast.error(errorMessage);
    }
  };

  // Handle accept bid
  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to accept this bid? This will reject all other bids for this job.')) {
      return;
    }

    try {
      const response = await bidAPI.acceptBid(bidId);
      if (response.success) {
        toast.success('Bid accepted successfully!');
        fetchBids(); // Refresh bids
        refreshJobs(); // Refresh jobs to update status
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      const errorMessage = error.response?.data?.error || 'Failed to accept bid';
      toast.error(errorMessage);
    }
  };

  // Handle reject bid
  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to reject this bid?')) {
      return;
    }

    try {
      const response = await bidAPI.rejectBid(bidId);
      if (response.success) {
        toast.success('Bid rejected');
        fetchBids(); // Refresh bids
      }
    } catch (error) {
      console.error('Error rejecting bid:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reject bid';
      toast.error(errorMessage);
    }
  };

  // Get bidding time remaining
  const getBiddingTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate - now;
    
    if (diff <= 0) return 'Closed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m left`;
  };

  // Get recent jobs (last 5)
  const recentJobs = jobs.slice(0, 5);

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
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshJobs}
                  disabled={loading}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No jobs posted yet</p>
                <Link to="/post-job" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                  Post your first job
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job, index) => {
                  const isBiddingOpen = job.biddingDeadline && new Date(job.biddingDeadline) > new Date() && (job.status === 'open' || job.status === 'bidding');
                  const timeRemaining = getBiddingTimeRemaining(job.biddingDeadline);
                  
                  return (
                    <motion.div
                      key={job._id || job.id}
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

                      {/* Bidding Deadline Info */}
                      {job.biddingDeadline && (
                        <div className={`mb-3 p-2 rounded-lg ${
                          isBiddingOpen ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                              <Calendar className={`w-3 h-3 mr-1 ${isBiddingOpen ? 'text-blue-600' : 'text-gray-500'}`} />
                              <span className={isBiddingOpen ? 'text-blue-700 font-medium' : 'text-gray-600'}>
                                {isBiddingOpen ? 'Bidding Open' : 'Bidding Closed'}
                              </span>
                            </div>
                            {timeRemaining && (
                              <span className={`font-semibold ${isBiddingOpen ? 'text-blue-700' : 'text-gray-500'}`}>
                                {timeRemaining}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500">Salary</div>
                          <div className="text-sm font-semibold text-gray-900">{job.salary || 'Not specified'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Posted</div>
                          <div className="text-sm text-gray-600">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${job._id || job.id}`}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          {(job.status === 'open' || job.status === 'bidding') && (
                            <>
                              <button
                                onClick={() => navigate(`/post-job?edit=${job._id || job.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job._id || job.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Recent Bids */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Bids</h2>
              <div className="text-sm text-gray-500">
                {bids.length} bid{bids.length !== 1 ? 's' : ''} received
              </div>
            </div>

            {bids.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No bids received yet</p>
                <p className="text-sm mt-2">Freelancers will bid on your job postings here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bids.slice(0, 5).map((bid, index) => (
                  <motion.div
                    key={bid._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{bid.freelancer.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bid.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Job:</span> {bid.job?.title || 'Unknown Job'}{bid.job?.company ? ` at ${bid.job.company}` : ''}
                        </div>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-gray-900">${bid.bidAmount}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 line-clamp-2">
                          {bid.coverLetter}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {bid.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptBid(bid._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Accept Bid"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectBid(bid._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Reject Bid"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <Link
                          to={bid.job?._id ? `/jobs/${bid.job._id}` : '#'}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title={bid.job?._id ? "View Job" : "Job information unavailable"}
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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

