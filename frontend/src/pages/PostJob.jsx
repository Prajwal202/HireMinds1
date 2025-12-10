import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Clock, FileText, Tag, Calendar } from 'lucide-react';
import { jobAPI } from '../api';
import toast from 'react-hot-toast';

const PostJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [biddingType, setBiddingType] = useState('duration'); // 'duration' or 'deadline'
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    type: 'Full-time',
    biddingDuration: 24,
    biddingDeadline: '',
  });

  // Fetch job data if editing
  useEffect(() => {
    const fetchJob = async () => {
      if (!editJobId) return;

      try {
        setLoading(true);
        const response = await jobAPI.getJobById(editJobId);
        if (response.success && response.data) {
          const job = response.data;
          setFormData({
            title: job.title || '',
            company: job.company || '',
            location: job.location || '',
            description: job.description || '',
            salary: job.salary || '',
            type: job.type || 'Full-time',
            biddingDuration: job.biddingDuration || 24,
            biddingDeadline: job.biddingDeadline ? new Date(job.biddingDeadline).toISOString().slice(0, 16) : '',
          });
          
          // Set bidding type based on existing deadline
          if (job.biddingDeadline) {
            setBiddingType('deadline');
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
        navigate('/recruiter/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [editJobId, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare job data
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        salary: formData.salary || 'Not specified',
        type: formData.type,
      };

      // Add bidding deadline or duration based on selection
      if (biddingType === 'deadline' && formData.biddingDeadline) {
        jobData.biddingDeadline = new Date(formData.biddingDeadline).toISOString();
      } else if (biddingType === 'duration' && formData.biddingDuration) {
        jobData.biddingDuration = parseInt(formData.biddingDuration);
      } else {
        // Default to 24 hours
        jobData.biddingDuration = 24;
      }

      let response;
      if (editJobId) {
        // Update existing job
        response = await jobAPI.updateJob(editJobId, jobData);
        if (response.success) {
          toast.success('Job updated successfully!');
          navigate('/recruiter/dashboard');
        }
      } else {
        // Create new job
        response = await jobAPI.createJob(jobData);
        if (response.success) {
          toast.success('Job posted successfully!');
          navigate('/recruiter/dashboard');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${editJobId ? 'update' : 'post'} job. Please try again.`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Data Science',
    'Content Writing',
    'DevOps',
    'Marketing',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mr-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {editJobId ? 'Edit Job' : 'Post a New Job'}
              </h1>
              <p className="text-gray-600 mt-1">
                {editJobId ? 'Update your job posting' : 'Find the perfect freelancer for your project'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Full Stack Web Developer"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., TechCorp Inc."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Remote, New York, USA"
              />
            </div>


            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="8"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe your project in detail. Include requirements, deliverables, and any specific instructions..."
              ></textarea>
              <p className="mt-2 text-sm text-gray-500">
                Provide a clear and detailed description to attract the right freelancers.
              </p>
            </div>


            {/* Salary */}
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Bidding Period Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                Bidding Period
              </h3>
              
              {/* Bidding Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Bidding Deadline
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setBiddingType('duration')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      biddingType === 'duration'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Duration (Hours)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiddingType('deadline')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      biddingType === 'deadline'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Specific Date & Time
                  </button>
                </div>
              </div>

              {/* Bidding Duration */}
              {biddingType === 'duration' && (
                <div>
                  <label htmlFor="biddingDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    Bidding Duration (Hours) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="biddingDuration"
                      name="biddingDuration"
                      required
                      min="1"
                      max="720"
                      value={formData.biddingDuration}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="24"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    How many hours from now should bidding close? (1-720 hours, default: 24)
                  </p>
                </div>
              )}

              {/* Bidding Deadline */}
              {biddingType === 'deadline' && (
                <div>
                  <label htmlFor="biddingDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Bidding Deadline *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      id="biddingDeadline"
                      name="biddingDeadline"
                      required={biddingType === 'deadline'}
                      value={formData.biddingDeadline}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Select a specific date and time when bidding should close
                  </p>
                </div>
              )}
            </div>


            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5 mr-2" />
                    {editJobId ? 'Update Job' : 'Post Job'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for posting a great job</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Write a clear and descriptive title that accurately reflects the job</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Provide detailed requirements and expectations in the description</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>List all required skills to attract qualified freelancers</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Set a realistic budget and timeline for your project</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default PostJob;
