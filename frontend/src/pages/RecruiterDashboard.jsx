import { useState, useEffect, useCallback, useRef } from 'react';

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

  RefreshCw,

  Bell,

  AlertCircle,

  TrendingDown,

  Target,

  Zap,

  BarChart3,

  UserCheck,

  Filter,

  Search

} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

import { jobAPI, bidAPI, authAPI, projectAPI } from '../api';

import { formatSalaryToINR } from '../utils/currency';

import toast from 'react-hot-toast';



const RecruiterDashboard = () => {

  const { user } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [jobs, setJobs] = useState([]);

  const [bids, setBids] = useState([]);

  const [activeProjects, setActiveProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [autoRefresh, setAutoRefresh] = useState(false);

  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const [searchTerm, setSearchTerm] = useState('');

  const [filterStatus, setFilterStatus] = useState('all');

  const intervalRef = useRef(null);



  // Notification system

  const addNotification = useCallback((notification) => {

    setNotifications(prev => [notification, ...prev].slice(0, 5));

  }, []);



  const removeNotification = useCallback((index) => {

    setNotifications(prev => prev.filter((_, i) => i !== index));

  }, []);



  // Auto-refresh functionality

  useEffect(() => {

    if (autoRefresh) {

      intervalRef.current = setInterval(() => {

        refreshJobs();

        fetchBids();

      }, refreshInterval);

    } else {

      if (intervalRef.current) {

        clearInterval(intervalRef.current);

      }

    }



    return () => {

      if (intervalRef.current) {

        clearInterval(intervalRef.current);

      }

    };

  }, [autoRefresh, refreshInterval]);



  // Toggle auto-refresh

  const toggleAutoRefresh = useCallback(() => {

    setAutoRefresh(prev => !prev);

    if (!autoRefresh) {

      toast.success('Auto-refresh enabled');

    } else {

      toast.success('Auto-refresh disabled');

    }

  }, [autoRefresh]);



  // Manual refresh function

  const refreshJobs = async () => {

    try {

      setIsRefreshing(true);

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

      

      // Check for new bids or status changes

      if (response.success) {

        const newJobs = response.data;

        

        // Check for new jobs

        if (jobs.length > 0 && newJobs.length > jobs.length) {

          addNotification({

            type: 'info',

            message: `New job posted: ${newJobs[newJobs.length - 1].title}`,

            timestamp: new Date()

          });

        }

        

        setJobs(newJobs);

        setLastUpdated(new Date());

        toast.success(`Dashboard refreshed! Found ${newJobs.length} jobs`);

      } else {

        toast.error('Failed to load jobs: ' + (response.message || 'Unknown error'));

      }

    } catch (error) {

      console.error('Error refreshing jobs:', error);

      toast.error('Failed to refresh jobs');

    } finally {

      setIsRefreshing(false);

    }

  };



  // Fetch bids for the recruiter

  const fetchBids = async () => {

    try {

      console.log('Fetching bids for recruiter...');

      const response = await bidAPI.getRecruiterBids();

      console.log('Bids response:', response);

      if (response.success) {

        const newBids = response.data;

        

        // Check for new bids

        if (bids.length > 0 && newBids.length > bids.length) {

          addNotification({

            type: 'success',

            message: `New bid received on ${newBids[newBids.length - 1].job?.title || 'a job'}`,

            timestamp: new Date()

          });

        }

        

        setBids(newBids);

        console.log('Bids loaded:', newBids.length);

      }

    } catch (error) {

      console.error('Error fetching bids:', error);

      // Don't show error toast for bids as it's not critical

    }

  };



  // Helper functions

  const formatTimeAgo = (timestamp) => {

    const now = new Date();

    const time = new Date(timestamp);

    const diff = now - time;

    

    const minutes = Math.floor(diff / 60000);

    const hours = Math.floor(diff / 3600000);

    const days = Math.floor(diff / 86400000);

    

    if (minutes < 1) return 'Just now';

    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    return `${days} day${days > 1 ? 's' : ''} ago`;

  };



  const getTrendIcon = (trend) => {

    switch (trend) {

      case 'up':

        return <TrendingUp className="w-4 h-4 text-green-600" />;

      case 'down':

        return <TrendingDown className="w-4 h-4 text-red-600" />;

      default:

        return <div className="w-4 h-4" />;

    }

  };



  // Filter jobs based on search and status

  const filteredJobs = jobs.filter(job => {

    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||

                         job.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;

    return matchesSearch && matchesStatus;

  });



  // Skeleton loader component

  const SkeletonCard = () => (

    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">

      <div className="flex items-center justify-between mb-4">

        <div className="bg-gray-300 p-3 rounded-lg w-12 h-12"></div>

      </div>

      <div className="h-8 bg-gray-300 rounded mb-2 w-16"></div>

      <div className="h-4 bg-gray-300 rounded mb-2 w-24"></div>

      <div className="h-3 bg-gray-300 rounded w-20"></div>

    </div>

  );



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



  // Trigger refresh when returning from Applicants page (after bid actions)

  useEffect(() => {

    // Check if we're coming from Applicants page

    const fromApplicants = document.referrer.includes('/applicants') || 

                       location.state?.from === 'applicants';

    if (fromApplicants) {

      console.log('Returning from Applicants page - refreshing dashboard data');

      setRefreshKey(prev => prev + 1);

    }

  }, [location.state?.from]);



  // Fetch jobs on component mount and when location changes or refresh state is set

  useEffect(() => {

    const fetchJobs = async () => {

      try {

        setLoading(true);

        console.log('Fetching jobs from API...');

        

        // Fetch jobs and active projects in parallel

        const [jobsResponse, projectsResponse] = await Promise.allSettled([

          (async () => {

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

            return response;

          })(),

          projectAPI.getRecruiterActiveProjects().catch(err => {

            console.log('Failed to fetch active projects:', err);

            return { success: false, data: [] };

          })

        ]);



        // Process jobs response

        const response = jobsResponse.status === 'fulfilled' ? jobsResponse.value : null;

        console.log('Final API response:', response);

        if (response && response.success) {

          console.log('Jobs data:', response.data);

          setJobs(response.data);

        } else {

          console.log('API response not successful:', response);

          toast.error('Failed to load jobs: ' + (response?.message || 'Unknown error'));

        }



        // Process projects response

        const projectsData = projectsResponse.status === 'fulfilled' ? projectsResponse.value : null;

        if (projectsData && projectsData.success) {

          setActiveProjects(projectsData.data);

        } else {

          setActiveProjects([]);

        }

      } catch (error) {

        console.error('Error fetching data:', error);

        toast.error('Failed to load your data');

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



  // Calculate stats from actual jobs and projects

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

      label: 'Active Projects',

      value: activeProjects.length.toString(),

      change: 'Currently in progress',

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

    if (!window.confirm('Are you sure you want to accept this bid? This will allocate the job to the freelancer and reject all other bids.')) {

      return;

    }



    try {

      const response = await bidAPI.acceptBid(bidId);

      if (response.success) {

        toast.success(response.message || 'Bid accepted successfully! Job allocated to freelancer.');

        fetchBids(); // Refresh bids

        refreshJobs(); // Refresh jobs to update status

        addNotification({

          type: 'success',

          message: `Job allocated to ${response.data.freelancer.name}`,

          timestamp: new Date()

        });

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



  // Project helper functions

  const getStatusColor = (status) => {

    switch (status) {

      case 'open':

        return 'text-green-700 bg-green-100';

      case 'bidding':

        return 'text-blue-700 bg-blue-100';

      case 'closed':

        return 'text-purple-700 bg-purple-100';

      case 'cancelled':

        return 'text-red-700 bg-red-100';

      default:

        return 'text-gray-700 bg-gray-100';

    }

  };



  const getStatusIcon = (status) => {

    switch (status) {

      case 'open':

        return <CheckCircle className="w-4 h-4" />;

      case 'bidding':

        return <Clock className="w-4 h-4" />;

      case 'closed':

        return <CheckCircle className="w-4 h-4" />;

      case 'cancelled':

        return <XCircle className="w-4 h-4" />;

      default:

        return null;

    }

  };



  const getProjectStatusColor = (status) => {

    switch (status) {

      case 'Work Started':

        return 'text-blue-700 bg-blue-100';

      case 'Initial Development':

        return 'text-indigo-700 bg-indigo-100';

      case 'Midway Completed':

        return 'text-purple-700 bg-purple-100';

      case 'Almost Done':

        return 'text-orange-700 bg-orange-100';

      case 'Completed':

        return 'text-green-700 bg-green-100';

      default:

        return 'text-gray-700 bg-gray-100';

    }

  };



  const getProjectStatusIcon = (status) => {

    switch (status) {

      case 'Work Started':

        return <Clock className="w-4 h-4" />;

      case 'Initial Development':

        return <TrendingUp className="w-4 h-4" />;

      case 'Midway Completed':

        return <BarChart3 className="w-4 h-4" />;

      case 'Almost Done':

        return <Zap className="w-4 h-4" />;

      case 'Completed':

        return <CheckCircle className="w-4 h-4" />;

      default:

        return null;

    }

  };



  const getProgressColor = (level) => {

    if (level === 0) return 'bg-blue-500';

    if (level === 1) return 'bg-indigo-500';

    if (level === 2) return 'bg-purple-500';

    if (level === 3) return 'bg-orange-500';

    if (level === 4) return 'bg-green-500';

    return 'bg-gray-500';

  };



  return (

    <div className="min-h-screen bg-gray-50 py-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Enhanced Header with controls */}

        <motion.div

          initial={{ opacity: 0, y: -20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.5 }}

          className="mb-8"

        >

          <div className="flex items-start justify-between">

            <div>

              <h1 className="text-4xl font-bold text-gray-900 mb-2">

                Welcome back, {user?.name || 'Recruiter'}! 👋

              </h1>

              <p className="text-gray-600">Manage your job postings and find the best talent.</p>

              {lastUpdated && (

                <p className="text-xs text-gray-500 mt-1">

                  Last updated: {formatTimeAgo(lastUpdated)}

                </p>

              )}

            </div>

            

            {/* Control Panel */}

            <div className="flex items-center gap-4">

              {/* Auto-refresh toggle */}

              <button

                onClick={toggleAutoRefresh}

                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${

                  autoRefresh 

                    ? 'bg-green-50 border-green-200 text-green-700' 

                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'

                }`}

              >

                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />

                <span className="text-sm font-medium">

                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}

                </span>

              </button>

              

              {/* Manual refresh */}

              <button

                onClick={refreshJobs}

                disabled={isRefreshing}

                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"

              >

                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />

                <span className="text-sm font-medium">Refresh</span>

              </button>

              

              {/* Notifications */}

              <div className="relative">

                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative">

                  <Bell className="w-5 h-5" />

                  {notifications.length > 0 && (

                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>

                  )}

                </button>

                

                {/* Notifications dropdown */}

                {notifications.length > 0 && (

                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">

                    <div className="p-4 border-b border-gray-200">

                      <h3 className="font-semibold text-gray-900">Notifications</h3>

                    </div>

                    <div className="max-h-96 overflow-y-auto">

                      {notifications.map((notification, index) => (

                        <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50">

                          <div className="flex items-start justify-between">

                            <div className="flex-1">

                              <p className="text-sm text-gray-900">{notification.message}</p>

                              <p className="text-xs text-gray-500 mt-1">

                                {formatTimeAgo(notification.timestamp)}

                              </p>

                            </div>

                            <button

                              onClick={() => removeNotification(index)}

                              className="ml-2 text-gray-400 hover:text-gray-600"

                            >

                              <XCircle className="w-4 h-4" />

                            </button>

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        </motion.div>



        {/* Enhanced Stats Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {loading ? (

            Array.from({ length: 4 }).map((_, index) => (

              <SkeletonCard key={index} />

            ))

          ) : (

            stats.map((stat, index) => (

              <motion.div

                key={index}

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.5, delay: index * 0.1 }}

                whileHover={{ y: -5 }}

                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200"

              >

                <div className="flex items-center justify-between mb-4">

                  <div className={`${stat.color} p-3 rounded-lg text-white`}>

                    {stat.icon}

                  </div>

                  {getTrendIcon(stat.trend || 'up')}

                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>

                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>

                <p className="text-xs text-green-600 font-medium flex items-center gap-1">

                  {stat.change}

                </p>

              </motion.div>

            ))

          )}

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

          {/* Enhanced Recent Job Postings */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.5, delay: 0.5 }}

            className="bg-white rounded-xl shadow-md p-6"

          >

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-gray-900">Recent Job Postings</h2>

              <div className="text-sm text-gray-500">

                {filteredJobs.length} of {jobs.length} jobs

              </div>

            </div>



            {/* Search and Filter Controls */}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">

              <div className="flex-1 relative">

                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                <input

                  type="text"

                  placeholder="Search jobs..."

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"

                />

              </div>

              <div className="flex items-center gap-2">

                <Filter className="w-4 h-4 text-gray-500" />

                <select

                  value={filterStatus}

                  onChange={(e) => setFilterStatus(e.target.value)}

                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"

                >

                  <option value="all">All Status</option>

                  <option value="open">Open</option>

                  <option value="bidding">Bidding</option>

                  <option value="closed">Closed</option>

                  <option value="cancelled">Cancelled</option>

                </select>

              </div>

              <button

                onClick={refreshJobs}

                disabled={loading || isRefreshing}

                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200 disabled:opacity-50"

                title="Refresh"

              >

                <RefreshCw className={`w-5 h-5 ${loading || isRefreshing ? 'animate-spin' : ''}`} />

              </button>

            </div>



            {loading ? (

              <div className="flex justify-center items-center py-8">

                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>

              </div>

            ) : filteredJobs.length === 0 ? (

              <div className="text-center py-8 text-gray-500">

                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />

                <p className="font-medium">No jobs found</p>

                <p className="text-sm mt-2">

                  {searchTerm || filterStatus !== 'all' 

                    ? 'Try adjusting your search or filters' 

                    : 'Post your first job to get started'

                  }

                </p>

                {!searchTerm && filterStatus === 'all' && (

                  <Link 

                    to="/post-job" 

                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 mt-4"

                  >

                    <Plus className="w-4 h-4" />

                    Post Your First Job

                  </Link>

                )}

              </div>

            ) : (

              <div className="space-y-4 max-h-96 overflow-y-auto">

                {filteredJobs.map((job, index) => {

                  const isBiddingOpen = job.biddingDeadline && new Date(job.biddingDeadline) > new Date() && (job.status === 'open' || job.status === 'bidding');

                  const timeRemaining = getBiddingTimeRemaining(job.biddingDeadline);

                  const bidCount = bids.filter(bid => bid.job?._id === job._id).length;

                  const isAllocated = job.allocatedTo && job.status === 'closed';

                  const acceptedBid = bids.find(bid => bid._id === job.acceptedBid);

                  

                  return (

                    <motion.div

                      key={job._id || job.id}

                      initial={{ opacity: 0, x: -20 }}

                      animate={{ opacity: 1, x: 0 }}

                      transition={{ duration: 0.3, delay: index * 0.1 }}

                      className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${

                        isAllocated ? 'border-green-200 bg-green-50' : 

                        'border-gray-200'

                      }`}

                    >

                      <div className="flex items-start justify-between mb-3">

                        <div className="flex-1">

                          <div className="flex items-center gap-2 mb-1">

                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>

                            {isAllocated && (

                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">

                                <UserCheck className="w-3 h-3" />

                                Allocated

                              </span>

                            )}

                            {!isAllocated && bidCount > 0 && (

                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">

                                <Users className="w-3 h-3" />

                                {bidCount} bid{bidCount !== 1 ? 's' : ''}

                              </span>

                            )}

                          </div>

                          <p className="text-sm text-gray-600">{job.company}</p>

                          {isAllocated && acceptedBid && (

                            <p className="text-xs text-green-600 mt-1">

                              Allocated to: {acceptedBid.freelancer?.name || 'Unknown Freelancer'}

                            </p>

                          )}

                        </div>

                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>

                          {getStatusIcon(job.status)}

                          {job.status}

                        </span>

                      </div>



                      {/* Enhanced Bidding Deadline Info */}

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

                          <div className="text-sm font-semibold text-gray-900">{formatSalaryToINR(job.salary) || 'Not specified'}</div>

                        </div>

                        <div className="text-right">

                          <div className="text-xs text-gray-500">Posted</div>

                          <div className="text-sm text-gray-600">

                            {formatTimeAgo(job.createdAt)}

                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <Link

                            to={`/jobs/${job._id || job.id}`}

                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"

                            title="View Details"

                          >

                            <Eye className="w-5 h-5" />

                          </Link>

                          {(job.status === 'open' || job.status === 'bidding') && !isAllocated && (

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

                          {isAllocated && (

                            <button

                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"

                              title="View Allocated Freelancer"

                            >

                              <UserCheck className="w-5 h-5" />

                            </button>

                          )}

                        </div>

                      </div>

                    </motion.div>

                  );

                })}

                

                {filteredJobs.length > 5 && (

                  <div className="text-center pt-4 border-t border-gray-200">

                    <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium text-sm">

                      View all {filteredJobs.length} jobs →

                    </Link>

                  </div>

                )}

              </div>

            )}

          </motion.div>



          {/* Active Projects */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.5, delay: 0.6 }}

            className="bg-white rounded-xl shadow-md p-6"

          >

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-gray-900">Active Projects</h2>

              <div className="flex items-center gap-4">

                <div className="text-sm text-gray-500">

                  {activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''}

                </div>

              </div>

            </div>



            {activeProjects.length === 0 ? (

              <div className="text-center py-8 text-gray-500">

                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />

                <p className="font-medium">No active projects</p>

                <p className="text-sm mt-2">Projects will appear here once they are allocated to freelancers</p>

              </div>

            ) : (

              <div className="space-y-4 max-h-96 overflow-y-auto">

                {activeProjects.map((project, index) => (

                  <motion.div

                    key={project._id}

                    initial={{ opacity: 0, x: -20 }}

                    animate={{ opacity: 1, x: 0 }}

                    transition={{ duration: 0.3, delay: index * 0.1 }}

                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200"

                  >

                    <div className="flex flex-col md:flex-row md:items-center justify-between">

                      <div className="flex-1 mb-4 md:mb-0">

                        <div className="flex items-start justify-between mb-2">

                          <div>

                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>

                            <p className="text-sm text-gray-600">Freelancer: {project.allocatedTo?.name || 'Unknown'}</p>

                            <p className="text-xs text-gray-500 mt-1">Allocated: {new Date(project.allocatedAt).toLocaleDateString()}</p>

                          </div>

                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.projectStatus)}`}>

                            {getProjectStatusIcon(project.projectStatus)}

                            {project.projectStatus}

                          </span>

                        </div>

                        

                        {/* Progress Bar */}

                        <div className="mt-3">

                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">

                            <span>Progress</span>

                            <span>{project.completionPercentage}%</span>

                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">

                            <div

                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progressLevel)}`}

                              style={{ width: `${project.completionPercentage}%` }}

                            ></div>

                          </div>

                        </div>

                      </div>



                      <div className="flex items-center gap-4 md:ml-6">

                        <div className="text-right">

                          <div className="text-sm text-gray-600">Budget</div>

                          <div className="text-lg font-bold text-gray-900">

                            ₹{project.budget 

                              ? project.budget.toLocaleString() 

                              : project.acceptedBid?.bidAmount 

                                ? project.acceptedBid.bidAmount.toLocaleString()

                                : 'N/A'

                            }

                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <Link

                            to={`/projects/${project._id}/payments`}

                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"

                            title="View Payments"

                          >

                            <DollarSign className="w-4 h-4" />

                            Pay Now

                          </Link>

                          <Link

                            to={`/projects/${project._id}`}

                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"

                            title="View Details"

                          >

                            <Eye className="w-5 h-5" />

                          </Link>

                        </div>

                      </div>

                    </div>

                  </motion.div>

                ))}

              </div>

            )}

          </motion.div>



        </div>

      </div>

    </div>

  );

};



export default RecruiterDashboard;



