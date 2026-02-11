import { useState, useEffect, useCallback, useRef } from 'react';
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
  Award,
  User,
  RefreshCw,
  Bell,
  AlertCircle,
  TrendingDown,
  Calendar,
  Target,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { freelancerAPI, bidAPI, projectAPI } from '../api';
import toast from 'react-hot-toast';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: 'Active Projects',
      value: '0',
      change: '+0 this week',
      color: 'bg-blue-500',
      trend: 'up',
      loading: false
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: 'Total Earnings',
      value: '₹0',
      change: '+₹0 this month',
      color: 'bg-green-500',
      trend: 'up',
      loading: false
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Success Rate',
      value: '0%',
      change: '+0% from last month',
      color: 'bg-purple-500',
      trend: 'up',
      loading: false
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Total Clients',
      value: '0',
      change: '+0 new clients',
      color: 'bg-orange-500',
      trend: 'up',
      loading: false
    },
  ]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const intervalRef = useRef(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadDashboardData(true);
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

  const loadDashboardData = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const [statsData, activeProjectsData, recentProjectsData, bidsData] = await Promise.all([
        freelancerAPI.getStats().catch(err => {
          console.error('Error fetching freelancer stats:', err);
          return null;
        }),
        projectAPI.getFreelancerActiveProjects().catch(err => {
          console.error('Error fetching active projects:', err);
          return { success: false, data: [] };
        }),
        projectAPI.getFreelancerRecentProjects().catch(err => {
          console.error('Error fetching recent projects:', err);
          return { success: false, data: [] };
        }),
        bidAPI.getFreelancerBids().catch(err => {
          console.error('Error fetching freelancer bids:', err);
          return { success: false, data: [] };
        })
      ]);

      // Process active projects data
      if (activeProjectsData && activeProjectsData.success) {
        setActiveProjects(activeProjectsData.data);
      } else {
        setActiveProjects([]);
      }

      // Process recent projects data
      if (recentProjectsData && recentProjectsData.success) {
        setRecentProjects(recentProjectsData.data);
      } else {
        setRecentProjects([]);
      }

      // Process bids data
      if (bidsData && bidsData.success) {
        const newBids = bidsData.data;
        console.log('Freelancer bids data:', newBids);
        
        // Check for new bids or status changes
        if (bids.length > 0 && newBids.length > bids.length) {
          addNotification({
            type: 'success',
            message: `New bid received on ${newBids[newBids.length - 1].job?.title || 'a job'}`,
            timestamp: new Date()
          });
        }
        
        // Check for bid status changes
        const statusChanges = newBids.filter(newBid => {
          const oldBid = bids.find(b => b._id === newBid._id);
          return oldBid && oldBid.status !== newBid.status && newBid.status === 'accepted';
        });
        
        statusChanges.forEach(bid => {
          addNotification({
            type: 'success',
            message: `Congratulations! Your bid on ${bid.job?.title || 'a job'} was accepted!`,
            timestamp: new Date()
          });
        });
        
        setBids(newBids);
      } else {
        console.log('Bids data not successful or missing');
        setBids([]);
      }

      // Process stats data
      if (statsData) {
        const activeProjectsCount = activeProjectsData?.success ? activeProjectsData.data.length : 0;
        const newStats = [
          {
            icon: <Briefcase className="w-6 h-6" />,
            label: 'Active Projects',
            value: activeProjectsCount.toString(),
            change: `+${statsData.newProjectsThisWeek || 0} this week`,
            color: 'bg-blue-500',
            trend: (statsData.newProjectsThisWeek || 0) > 0 ? 'up' : 'neutral',
            loading: false
          },
          {
            icon: <DollarSign className="w-6 h-6" />,
            label: 'Total Earnings',
            value: `$${statsData.totalEarnings?.toLocaleString() || '0'}`,
            change: `+$${statsData.earningsThisMonth?.toLocaleString() || 0} this month`,
            color: 'bg-green-500',
            trend: (statsData.earningsThisMonth || 0) > 0 ? 'up' : 'neutral',
            loading: false
          },
          {
            icon: <TrendingUp className="w-6 h-6" />,
            label: 'Success Rate',
            value: `${statsData.successRate || 0}%`,
            change: `${statsData.successRateChange >= 0 ? '+' : ''}${statsData.successRateChange || 0}% from last month`,
            color: 'bg-purple-500',
            trend: (statsData.successRateChange || 0) > 0 ? 'up' : (statsData.successRateChange || 0) < 0 ? 'down' : 'neutral',
            loading: false
          },
          {
            icon: <Users className="w-6 h-6" />,
            label: 'Total Clients',
            value: statsData.totalClients || '0',
            change: `+${statsData.newClients || 0} new clients`,
            color: 'bg-orange-500',
            trend: (statsData.newClients || 0) > 0 ? 'up' : 'neutral',
            loading: false
          },
        ];
        
        setStats(newStats);
      }
      
      setLastUpdated(new Date());
      
      if (isBackgroundRefresh) {
        toast.success('Dashboard updated');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (!isBackgroundRefresh) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Notification system
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep only last 5 notifications
  }, []);

  const removeNotification = useCallback((index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, []);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
    if (!autoRefresh) {
      toast.success('Auto-refresh enabled');
    } else {
      toast.success('Auto-refresh disabled');
    }
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Not Started':
        return 'bg-gray-100 text-gray-700';
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
      case 'Not Started':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getProjectStatus = (project) => {
    return project.projectStatus || 'Not Started';
  };

  const getProgressPercentage = (project) => {
    return project.completionPercentage || 0;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with notifications and controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'Freelancer'}! 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your projects today.</p>
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
                onClick={handleRefresh}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
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
                  {getTrendIcon(stat.trend)}
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
              <h2 className="text-2xl font-bold mb-2">Ready for your next project?</h2>
              <p className="text-primary-100">Browse available jobs and start earning today!</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/freelancer/payments"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                <DollarSign className="w-5 h-5 inline mr-2" />
                View Payments
              </Link>
              <Link
                to="/jobs"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Browse Jobs
              </Link>
              <Link
                to="/freelancer/profile"
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                <User className="w-5 h-5 inline mr-2" />
                Update Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {recentProjects.length} project{recentProjects.length !== 1 ? 's' : ''}
              </div>
              <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
                View All
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No projects allocated yet</p>
                <p className="text-sm mt-2">Projects will appear here once they are allocated to you</p>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 mt-4"
                >
                  <Target className="w-4 h-4" />
                  Browse Available Jobs
                </Link>
              </div>
            ) : (
              recentProjects.map((project, index) => (
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
                          <p className="text-sm text-gray-600">Recruiter: {project.postedBy?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 mt-1">Allocated: {new Date(project.allocatedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getProjectStatus(project))}`}>
                          {getStatusIcon(getProjectStatus(project))}
                          {getProjectStatus(project)}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{getProgressPercentage(project)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(project)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:ml-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Budget</div>
                        <div className="text-lg font-bold text-gray-900">${project.acceptedBid?.bidAmount || 'N/A'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/projects/${project._id}`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        {getProjectStatus(project) !== 'Completed' && (
                          <Link
                            to={`/projects/${project._id}/progress`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Update Progress"
                          >
                            <Target className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Enhanced Recent Bids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Bids</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {bids.length} bid{bids.length !== 1 ? 's' : ''} submitted
              </div>
              <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
                Browse Jobs
              </Link>
            </div>
          </div>

          {bids.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No bids submitted yet</p>
              <p className="text-sm mt-2">Start bidding on jobs to see them here</p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 mt-4"
              >
                <Target className="w-4 h-4" />
                Browse Available Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.filter(bid => bid.job).slice(0, 5).map((bid, index) => (
                <motion.div
                  key={bid._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                    bid.status === 'accepted' ? 'border-green-200 bg-green-50' :
                    bid.status === 'rejected' ? 'border-red-200 bg-red-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{bid.job?.title || 'Unknown Job'}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bid.status === 'pending' && <Clock className="w-3 h-3" />}
                          {bid.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                          {bid.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                        {bid.status === 'accepted' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Job Allocated!
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Company:</span> {bid.job?.company || 'Unknown Company'}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">${bid.bidAmount}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                        </div>
                        {bid.status === 'accepted' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Zap className="w-3 h-3" />
                            <span className="text-xs font-medium">Start working!</span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 line-clamp-2">
                        {bid.coverLetter}
                      </div>
                      
                      {bid.status === 'accepted' && (
                        <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 font-medium mb-1">
                            🎉 Congratulations! Your bid was accepted.
                          </p>
                          <p className="text-xs text-green-600">
                            The job has been allocated to you. Contact the recruiter to discuss next steps.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={bid.job?._id ? `/jobs/${bid.job._id}` : '#'}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                        title={bid.job?._id ? "View Job" : "Job information unavailable"}
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      {bid.status === 'accepted' && (
                        <>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Start Project"
                          >
                            <Award className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Contact Recruiter"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {bids.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <Link
                    to="/bids"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View all {bids.length} bids →
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;

