import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bidAPI, jobAPI } from '../api';
import { formatSalaryToINR } from '../utils/currency';
import toast from 'react-hot-toast';

const Applicants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch bids and jobs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bids for the recruiter
        const bidsResponse = await bidAPI.getRecruiterBids();
        if (bidsResponse.success) {
          setBids(bidsResponse.data);
        }

        // Fetch jobs to get job details
        const jobsResponse = await jobAPI.getMyJobs().catch(async () => {
          const allJobsResponse = await jobAPI.getAllJobs();
          if (allJobsResponse.success && user) {
            allJobsResponse.data = allJobsResponse.data.filter(job => 
              job.postedBy && (job.postedBy._id === user.id || job.postedBy === user.id)
            );
          }
          return allJobsResponse;
        });

        if (jobsResponse.success) {
          setJobs(jobsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load applicants data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, refreshKey]);

  // Group bids by job
  const jobsWithBids = jobs.map(job => {
    const jobBids = bids.filter(bid => bid.job?._id === job._id);
    return {
      ...job,
      bids: jobBids.sort((a, b) => (a.bidAmount || 0) - (b.bidAmount || 0)),
      bidCount: jobBids.length
    };
  }); // Show all jobs, not just those with bids

  // Filter jobs based on search and status
  const filteredJobs = jobsWithBids.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle accept bid
  const handleAcceptBid = async (bidId, jobId) => {
    if (!window.confirm('Are you sure you want to accept this bid? This will allocate the job to the freelancer and reject all other bids.')) {
      return;
    }

    try {
      const response = await bidAPI.acceptBid(bidId);
      if (response.success) {
        toast.success(response.message || 'Bid accepted successfully! Job allocated to freelancer.');
        // Refresh data properly instead of full page reload
        setRefreshKey(prev => prev + 1);
        // Refetch data
        const fetchData = async () => {
          try {
            // Fetch bids for the recruiter
            const bidsResponse = await bidAPI.getRecruiterBids();
            if (bidsResponse.success) {
              setBids(bidsResponse.data);
            }

            // Fetch jobs to get job details
            const jobsResponse = await jobAPI.getMyJobs().catch(async () => {
              const allJobsResponse = await jobAPI.getAllJobs();
              if (allJobsResponse.success && user) {
                allJobsResponse.data = allJobsResponse.data.filter(job => 
                  job.postedBy && (job.postedBy._id === user.id || job.postedBy === user.id)
                );
              }
              return allJobsResponse;
            });

            if (jobsResponse.success) {
              setJobs(jobsResponse.data);
            }
          } catch (error) {
            console.error('Error refreshing data:', error);
          }
        };
        
        fetchData();
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      const errorMessage = error.response?.data?.error || 'Failed to accept bid';
      toast.error(errorMessage);
    }
  };

  // Handle reject bid
  const handleRejectBid = async (bidId, jobId) => {
    if (!window.confirm('Are you sure you want to reject this bid?')) {
      return;
    }

    try {
      const response = await bidAPI.rejectBid(bidId);
      if (response.success) {
        toast.success('Bid rejected');
        // Refresh data properly instead of full page reload
        setRefreshKey(prev => prev + 1);
        // Refetch data
        const fetchData = async () => {
          try {
            // Fetch bids for the recruiter
            const bidsResponse = await bidAPI.getRecruiterBids();
            if (bidsResponse.success) {
              setBids(bidsResponse.data);
            }

            // Fetch jobs to get job details
            const jobsResponse = await jobAPI.getMyJobs().catch(async () => {
              const allJobsResponse = await jobAPI.getAllJobs();
              if (allJobsResponse.success && user) {
                allJobsResponse.data = allJobsResponse.data.filter(job => 
                  job.postedBy && (job.postedBy._id === user.id || job.postedBy === user.id)
                );
              }
              return allJobsResponse;
            });

            if (jobsResponse.success) {
              setJobs(jobsResponse.data);
            }
          } catch (error) {
            console.error('Error refreshing data:', error);
          }
        };
        
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting bid:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reject bid';
      toast.error(errorMessage);
    }
  };

  // Get bid status color
  const getBidStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get bid status icon
  const getBidStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'bidding':
        return 'bg-blue-100 text-blue-700';
      case 'closed':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/recruiter/dashboard', { state: { from: 'applicants' } })}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Applicants</h1>
                <p className="text-gray-600">Manage and review applications for your job postings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Jobs with Applications
                </span>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {filteredJobs.length} Jobs
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-lg text-white">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{jobsWithBids.length}</h3>
              <p className="text-sm text-gray-600">Jobs with Applications</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-500 p-3 rounded-lg text-white">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{bids.length}</h3>
              <p className="text-sm text-gray-600">Total Applicants</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500 p-3 rounded-lg text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {bids.filter(b => b.status === 'accepted').length}
              </h3>
              <p className="text-sm text-gray-600">Accepted Bids</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 p-3 rounded-lg text-white">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {bids.filter(b => b.status === 'pending').length}
              </h3>
              <p className="text-sm text-gray-600">Pending Review</p>
            </motion.div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Jobs</option>
                  <option value="open">Open</option>
                  <option value="bidding">Bidding</option>
                  <option value="closed">Allocated/Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>Showing {filteredJobs.length} of {jobsWithBids.length} jobs with applications</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jobs with Applications */}
        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No jobs found matching your criteria'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Briefcase className="w-5 h-5" />
                Post a New Job
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job, jobIndex) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: jobIndex * 0.1 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
              >
                {/* Job Header */}
                <div className="bg-gradient-to-r from-primary-50 to-indigo-50 p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          {job.status === 'closed' && job.allocatedTo ? 'Allocated' : job.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Posted {getTimeAgo(job.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{job.bidCount} applicant{job.bidCount !== 1 ? 's' : ''}</span>
                        </div>
                        {job.biddingDeadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(job.biddingDeadline) > new Date() 
                                ? `Bidding closes ${getTimeAgo(job.biddingDeadline)}` 
                                : 'Bidding closed'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Budget</div>
                      <div className="text-lg font-bold text-primary-600">
                        {job.salary || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Freelancer Bids */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Freelancer Applications ({job.bids.length})
                  </h4>
                  
                  {job.bids.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No applications yet</p>
                      <p className="text-sm">This job is waiting for freelancer applications</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.bids.map((bid, bidIndex) => (
                        <motion.div
                          key={bid._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: bidIndex * 0.05 }}
                          className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 relative ${
                            bid.status === 'accepted' ? 'border-green-200 bg-green-50' : 
                            bid.status === 'rejected' ? 'border-red-200 bg-red-50' : 
                            'border-gray-200'
                          }`}
                        >
                          {/* Ranking Badge */}
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            {bidIndex + 1}
                          </div>

                          {/* Bid Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">
                                  {bid.freelancer?.name || 'Unknown Freelancer'}
                                </h5>
                                <p className="text-sm text-gray-600">{bid.freelancer?.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span className="text-sm font-bold text-green-700">
                                  {formatSalaryToINR(bid.bidAmount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBidStatusColor(bid.status)}`}>
                              {getBidStatusIcon(bid.status)}
                              {bid.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              Applied {getTimeAgo(bid.createdAt)}
                            </span>
                          </div>

                          {/* Proposal */}
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {bid.coverLetter || 'No cover letter provided'}
                            </p>
                          </div>

                          {/* Freelancer Info */}
                          {bid.freelancer && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {bid.freelancer.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {bid.freelancer.phone}
                                  </span>
                                )}
                                {bid.freelancer.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {bid.freelancer.location}
                                  </span>
                                )}
                                {bid.freelancer.experience && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {bid.freelancer.experience} years
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {bid.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptBid(bid._id, job._id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectBid(bid._id, job._id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          )}

                          {bid.status === 'accepted' && (
                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              <span>Accepted - Job allocated to this freelancer</span>
                            </div>
                          )}

                          {bid.status === 'rejected' && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                              <XCircle className="w-4 h-4" />
                              <span>Rejected</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
