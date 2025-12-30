import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  MapPin, 
  Briefcase, 
  Calendar,
  User,
  Star,
  Send,
  Edit,
  Trash2
} from 'lucide-react';
import { jobAPI, bidAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import SimplePopup from '../components/SimplePopup';
import { formatSalaryToINR } from '../utils/currency';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [userBid, setUserBid] = useState(null); // Track if user has already bid

  // Check if user has already bid on this job
  const checkUserBid = async () => {
    if (user?.role === 'freelancer' && job?._id) {
      try {
        console.log('Checking if user has bid on job:', job._id);
        // Get all freelancer's bids and check if any match this job
        const response = await bidAPI.getFreelancerBids();
        console.log('Freelancer bids response:', response);
        if (response.success) {
          const userBidData = response.data.find(bid => 
            bid.job._id === job._id
          );
          console.log('Found user bid for this job:', userBidData);
          setUserBid(userBidData || null);
        }
      } catch (error) {
        console.error('Error checking user bid:', error);
      }
    }
  };

  // Check user bid when job data is loaded
  useEffect(() => {
    if (job && user) {
      checkUserBid();
    }
  }, [job, user]);

  // Handle popup close with auto-close timer
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Auto-close popup after 3 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  // Handle bid submission
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    console.log('Bid submission started:', { bidAmount, coverLetter, jobId: job?._id, userRole: user?.role });
    
    if (!bidAmount || !coverLetter) {
      toast.error('Please fill in all bid fields');
      return;
    }

    setIsSubmittingBid(true);
    try {
      const bidData = {
        jobId: job._id,
        bidAmount: parseFloat(bidAmount),
        coverLetter: coverLetter.trim()
      };
      
      console.log('Submitting bid data:', bidData);
      const response = await bidAPI.createBid(bidData);
      console.log('Bid submission response:', response);
      
      if (response.success) {
        // Show success popup with backend message
        setPopupMessage(response.message || 'Bid submitted successfully.');
        setShowPopup(true);
        setBidAmount('');
        setCoverLetter('');
        // Refresh user bid status
        await checkUserBid();
        // Refresh job data to show updated status
        const fetchJob = async () => {
          try {
            const response = await jobAPI.getJobById(id);
            if (response.success) {
              setJob(response.data);
            }
          } catch (err) {
            console.error('Error refreshing job:', err);
          }
        };
        fetchJob();
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit bid';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        console.log('Fetching job details for ID:', id);
        const response = await jobAPI.getJobById(id);
        console.log('Job details response:', response);
        
        if (response.success) {
          setJob(response.data);
        } else {
          setError('Job not found');
          toast.error('Job not found');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details');
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  // Handle job edit
  const handleEditJob = () => {
    navigate(`/post-job?edit=${id}`);
  };

  // Handle job delete
  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await jobAPI.deleteJob(id);
      if (response.success) {
        toast.success('Job deleted successfully');
        navigate('/recruiter/dashboard');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  // Check if user can edit/delete this job
  const canEditJob = user && job && (
    user.role === 'admin' || 
    (job.postedBy && (job.postedBy._id === user.id || job.postedBy === user.id))
  );

  // Format posted time
  const formatPostedTime = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffHours > 0) return `${diffHours} hours ago`;
    return 'Just now';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            to="/jobs"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              {/* Job Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      job.type === 'Fixed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {job.type}
                    </span>
                    {canEditJob && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditJob}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Job"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleDeleteJob}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Job"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted {formatPostedTime(job.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.type}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {job.status || 'Open'}
                  </div>
                </div>
              </div>

              {/* Job Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center text-green-600 mb-1">
                    <DollarSign className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Salary</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatSalaryToINR(job.salary) || 'Not specified'}</div>
                </div>
                <div>
                  <div className="flex items-center text-blue-600 mb-1">
                    <Clock className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Type</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{job.type}</div>
                </div>
                <div>
                  <div className="flex items-center text-purple-600 mb-1">
                    <Briefcase className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Status</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{job.status || 'Open'}</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.description}
                </div>
              </div>

              {/* Skills Required */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Company</h3>
                    <p className="text-gray-700">{job.company}</p>
                  </div>
                  {job.biddingDeadline && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Bidding Deadline</h3>
                      <p className="text-gray-700">{new Date(job.biddingDeadline).toLocaleString()}</p>
                    </div>
                  )}
                  {job.biddingDuration && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Bidding Duration</h3>
                      <p className="text-gray-700">{job.biddingDuration} hours</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bid Form - Only for freelancers */}
              {console.log('Bid form visibility check:', { 
                userRole: user?.role, 
                jobId: job?._id, 
                jobExists: !!job, 
                userBid,
                jobStatus: job?.status,
                biddingDeadline: job?.biddingDeadline,
                now: new Date(),
                deadlinePassed: job?.biddingDeadline ? new Date() > new Date(job.biddingDeadline) : 'N/A'
              })}
              {user?.role === 'freelancer' && job && job.status !== 'closed' && job.status !== 'cancelled' && (
                <div className="border-t pt-8">
                  {/* Check if bidding deadline has passed */}
                  {job.biddingDeadline && new Date() > new Date(job.biddingDeadline) ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600">⏰</span>
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-900">Bidding Closed</h3>
                      </div>
                      <p className="text-yellow-800">
                        The bidding deadline for this job has passed. No more bids are being accepted.
                      </p>
                    </div>
                  ) : job.allocatedTo ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">✓</span>
                        </div>
                        <h3 className="text-lg font-semibold text-green-900">Job Allocated</h3>
                      </div>
                      <p className="text-green-800">
                        This job has already been allocated to a freelancer.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {userBid ? 'Your Bid Status' : 'Submit Your Proposal'}
                      </h2>
                      
                      {userBid ? (
                    // Show existing bid status
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">Bid Submitted</h3>
                          <p className="text-blue-700">You have already placed a bid on this job</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          userBid.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          userBid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {userBid.status.charAt(0).toUpperCase() + userBid.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Bid Amount:</span>
                          <span className="ml-2 font-semibold text-gray-900">₹{userBid.bidAmount}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Submitted:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(userBid.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {userBid.coverLetter && (
                          <div>
                            <span className="text-sm text-gray-600">Cover Letter:</span>
                            <p className="mt-1 text-gray-900 bg-white p-3 rounded border border-gray-200">
                              {userBid.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {userBid.status === 'pending' && 'Your bid is under review. You will be notified when the recruiter makes a decision.'}
                          {userBid.status === 'accepted' && 'Congratulations! Your bid has been accepted. Contact the recruiter for next steps.'}
                          {userBid.status === 'rejected' && 'Your bid was not selected for this position.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Show bid form
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Bid Amount (₹)
                        </label>
                        <input
                          type="number"
                          id="bidAmount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Enter your bid amount in INR"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                          min="1"
                          step="0.01"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Enter amount in Indian Rupees (₹)
                        </div>
                      </div>
                      <div>
                        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                          Cover Letter
                        </label>
                        <textarea
                          id="coverLetter"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows="6"
                          placeholder="Explain why you're the best fit for this job..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                          maxLength="5000"
                        ></textarea>
                        <div className="text-xs text-gray-500 mt-1">
                          {coverLetter.length}/5000 characters
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingBid}
                        className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 disabled:opacity-75"
                      >
                        {isSubmittingBid ? (
                          'Submitting...'
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Proposal
                          </>
                        )}
                      </button>
                    </form>
                  )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 sticky top-24"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                    {job.postedBy?.name ? job.postedBy.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {job.postedBy?.name || 'Unknown'}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{job.postedBy?.email || 'No email available'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-semibold text-gray-900">
                      {formatPostedTime(job.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Success Popup */}
      <SimplePopup 
        show={showPopup}
        message={popupMessage}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default JobDetails;
