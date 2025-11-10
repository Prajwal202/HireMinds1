import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import JobCard from '../components/JobCard';

const JobList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dummy job data
  const jobs = [
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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
          <p className="text-gray-600">Find your next opportunity from {jobs.length} available jobs</p>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
              <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Sort
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredJobs.length}</span> results
          </p>
        </motion.div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </motion.div>
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
