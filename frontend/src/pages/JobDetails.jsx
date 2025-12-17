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
import { jobAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Handle bid submission
  const handleBidSubmit = (e) => {
    e.preventDefault();
    toast.success('Bid submitted successfully! (This is a demo)');
    setBidAmount('');
    setCoverLetter('');
  };

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
                  <div className="text-2xl font-bold text-gray-900">{job.salary || 'Not specified'}</div>
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

              {/* Bid Form */}
              <div className="border-t pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Your Proposal</h2>
                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Bid Amount ($)
                    </label>
                    <input
                      type="number"
                      id="bidAmount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter your bid amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
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
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Proposal
                  </button>
                </form>
              </div>
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
    </div>
  );
};

export default JobDetails;
