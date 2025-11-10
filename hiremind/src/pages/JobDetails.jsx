import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Send
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Dummy job data (in real app, fetch based on id)
  const job = {
    id: id,
    title: 'Full Stack Web Developer Needed',
    description: `We are looking for an experienced full stack developer to build a modern e-commerce platform. 
    
    The project involves:
    - Building a responsive frontend using React
    - Developing RESTful APIs with Node.js and Express
    - Database design and implementation with MongoDB
    - Integration with payment gateways (Stripe/PayPal)
    - User authentication and authorization
    - Admin dashboard for managing products and orders
    
    The ideal candidate should have:
    - 3+ years of experience in full stack development
    - Strong knowledge of React, Node.js, and MongoDB
    - Experience with payment gateway integrations
    - Good understanding of security best practices
    - Excellent communication skills
    
    This is a great opportunity to work on an exciting project with a growing startup!`,
    client: {
      name: 'TechCorp Inc.',
      rating: 4.8,
      reviews: 127,
      jobsPosted: 45,
      hireRate: 92,
    },
    budget: '5000',
    duration: '3 months',
    type: 'Fixed',
    location: 'Remote',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe', 'REST API', 'Git'],
    postedTime: '2 hours ago',
    proposals: 12,
    category: 'Web Development',
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    alert('Bid submitted successfully! (This is a demo)');
    setBidAmount('');
    setCoverLetter('');
  };

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
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    job.type === 'Fixed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {job.type} Price
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted {job.postedTime}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.category}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {job.proposals} Proposals
                  </div>
                </div>
              </div>

              {/* Job Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center text-green-600 mb-1">
                    <DollarSign className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Budget</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">${job.budget}</div>
                </div>
                <div>
                  <div className="flex items-center text-blue-600 mb-1">
                    <Clock className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{job.duration}</div>
                </div>
                <div>
                  <div className="flex items-center text-purple-600 mb-1">
                    <Briefcase className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Experience</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Expert</div>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Client</h3>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                    {job.client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{job.client.name}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{job.client.rating} ({job.client.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jobs Posted</span>
                    <span className="font-semibold text-gray-900">{job.client.jobsPosted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hire Rate</span>
                    <span className="font-semibold text-gray-900">{job.client.hireRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">Jan 2023</span>
                  </div>
                </div>
              </div>

              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200">
                View Client Profile
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
