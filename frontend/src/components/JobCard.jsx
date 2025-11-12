import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, DollarSign, MapPin, Briefcase } from 'lucide-react';

const JobCard = ({ job }) => {
  // Handle both backend (_id) and frontend (id) data
  const jobId = job._id || job.id;
  const company = job.company || job.client || 'Company';
  const salary = job.salary || (job.budget ? `$${job.budget}` : 'Not specified');
  const location = job.location || 'Remote';
  const postedTime = job.postedTime || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-primary-300 transition-all duration-300 h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link to={`/jobs/${jobId}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200">
              {job.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            {company}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.type === 'Full-time' || job.type === 'Fixed'
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {job.type}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {job.description}
      </p>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
            <span className="font-semibold text-gray-900">{salary}</span>
          </div>
          {job.duration && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{job.duration}</span>
            </div>
          )}
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
      <Link
          to={`/jobs/${jobId}`}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm  font-medium hover:bg-primary-700 transition-colors duration-200 w-full"
        >
          View Details
        </Link>
      </div>
      <div className="mt-3 text-xs text-gray-400">
        Posted {postedTime}
      </div>
    </motion.div>
  );
};

export default JobCard;
