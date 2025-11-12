import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Clock, FileText, Tag } from 'lucide-react';
import { jobAPI } from '../api';
import toast from 'react-hot-toast';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    type: 'Full-time',
  });

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
      const response = await jobAPI.createJob(formData);
      
      if (response.success) {
        toast.success('Job posted successfully!');
        navigate('/jobs');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
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
              <h1 className="text-4xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600 mt-1">Find the perfect freelancer for your project</p>
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
                    Post Job
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
