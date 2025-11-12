import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import JobCard from '../components/JobCard';
import { jobAPI } from '../api';
import toast from 'react-hot-toast';

const JobList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getAllJobs();
        if (response.success) {
          setJobs(response.data);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Dummy job data (fallback)
  const dummyJobs = [
    {
      id: 1,
      title: 'Full Stack Web Developer Needed',
      description: 'Looking for an experienced full stack developer to build a modern e-commerce platform with React and Node.js. Must have experience with payment integrations.',
      client: 'TechCorp Inc.',
      budget: '5000',
      duration: '3 months',
      type: 'Fixed',
      location: 'Remote',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
      postedTime: '2 hours ago',
    },
    {
      id: 2,
      title: 'Mobile App UI/UX Designer',
      description: 'Need a creative designer to design a mobile app for fitness tracking. Should have experience with Figma and modern design principles.',
      client: 'FitLife Solutions',
      budget: '2500',
      duration: '1 month',
      type: 'Fixed',
      location: 'Remote',
      skills: ['Figma', 'UI/UX', 'Mobile Design', 'Prototyping'],
      postedTime: '5 hours ago',
    },
    {
      id: 3,
      title: 'Python Data Scientist',
      description: 'Seeking a data scientist to analyze customer behavior data and build predictive models. Experience with machine learning required.',
      client: 'DataViz Analytics',
      budget: '4000',
      duration: '2 months',
      type: 'Hourly',
      location: 'Remote',
      skills: ['Python', 'Machine Learning', 'Pandas', 'TensorFlow', 'SQL'],
      postedTime: '1 day ago',
    },
    {
      id: 4,
      title: 'WordPress Website Development',
      description: 'Need a WordPress developer to create a business website with custom theme and plugins. SEO optimization required.',
      client: 'Small Biz Co.',
      budget: '1500',
      duration: '3 weeks',
      type: 'Fixed',
      location: 'Remote',
      skills: ['WordPress', 'PHP', 'CSS', 'SEO', 'JavaScript'],
      postedTime: '2 days ago',
    },
    {
      id: 5,
      title: 'Content Writer for Tech Blog',
      description: 'Looking for a technical content writer to create engaging blog posts about AI, blockchain, and emerging technologies.',
      client: 'Tech Insights Media',
      budget: '800',
      duration: '1 month',
      type: 'Hourly',
      location: 'Remote',
      skills: ['Content Writing', 'SEO', 'Technical Writing', 'Research'],
      postedTime: '3 days ago',
    },
    {
      id: 6,
      title: 'DevOps Engineer - AWS Expert',
      description: 'Need an experienced DevOps engineer to set up CI/CD pipelines and manage AWS infrastructure for our SaaS platform.',
      client: 'CloudScale Systems',
      budget: '6000',
      duration: '4 months',
      type: 'Hourly',
      location: 'Remote',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
      postedTime: '4 days ago',
    },
  ];

  const categories = [
    'all',
    'Web Development',
    'Mobile Development',
    'Design',
    'Data Science',
    'Content Writing',
    'DevOps',
  ];

  // Use dummy jobs if no jobs from backend
  const displayJobs = jobs.length > 0 ? jobs : dummyJobs;

  const filteredJobs = displayJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find your next opportunity from {displayJobs.length} available jobs</p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs by title, skills, or description..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <SlidersHorizontal className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Job Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-sm"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <button className="px-8 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200">
              Load More Jobs
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobList;
