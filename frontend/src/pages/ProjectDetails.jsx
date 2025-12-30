import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Target,
  TrendingUp,
  AlertCircle,
  Save,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../api';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [progressLevels, setProgressLevels] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(0);

  useEffect(() => {
    loadProjectDetails();
    loadProgressLevels();
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjectDetails(id);
      if (response.success) {
        setProject(response.data);
        setSelectedLevel(response.data.progressLevel || 0);
      } else {
        toast.error('Failed to load project details');
        navigate('/freelancer/dashboard');
      }
    } catch (error) {
      console.error('Error loading project details:', error);
      toast.error('Failed to load project details');
      navigate('/freelancer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadProgressLevels = async () => {
    try {
      const response = await projectAPI.getProgressLevels();
      if (response.success) {
        setProgressLevels(response.data);
      }
    } catch (error) {
      console.error('Error loading progress levels:', error);
    }
  };

  const handleProgressUpdate = async () => {
    if (selectedLevel <= project.progressLevel) {
      toast.error('Cannot move backwards in progress');
      return;
    }

    try {
      setUpdating(true);
      const response = await projectAPI.updateProjectProgress(id, selectedLevel);
      if (response.success) {
        toast.success('Project progress updated successfully');
        setProject(prev => ({
          ...prev,
          progressLevel: response.progressLevel,
          completionPercentage: response.completionPercentage,
          projectStatus: response.projectStatus
        }));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(error.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

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

  const getProgressColor = (level) => {
    if (level === 0) return 'bg-gray-500';
    if (level === 1) return 'bg-blue-500';
    if (level === 2) return 'bg-indigo-500';
    if (level === 3) return 'bg-purple-500';
    if (level === 4) return 'bg-orange-500';
    if (level === 5) return 'bg-green-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <Link to="/freelancer/dashboard" className="text-primary-600 hover:text-primary-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isFreelancer = user.role === 'freelancer';
  const canUpdateProgress = isFreelancer && project.allocatedTo?._id === user.id && project.progressLevel < 5;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/freelancer/dashboard"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600 mt-1">Project Details & Progress</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.projectStatus)}`}>
              {project.projectStatus}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Project Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <p className="text-gray-600 mt-1">{project.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Posted By</h3>
                    <p className="text-gray-600">{project.postedBy?.name || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Budget</h3>
                    <p className="text-gray-600">₹{project.acceptedBid?.bidAmount || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Allocated Date</h3>
                    <p className="text-gray-600">
                      {project.allocatedAt ? new Date(project.allocatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Progress */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Progress</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion</span>
                  <span className="text-sm font-bold text-primary-600">{project.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(project.progressLevel)}`}
                    style={{ width: `${project.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getProgressColor(project.progressLevel)} text-white`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.progressLevel}</div>
                    <div className="text-xs">Level</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progress Update Section */}
          {canUpdateProgress && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Progress</h2>
                
                <div className="space-y-4">
                  {Object.entries(progressLevels).map(([level, data]) => {
                    const levelNum = parseInt(level);
                    const isCurrent = levelNum === project.progressLevel;
                    const isSelected = levelNum === selectedLevel;
                    const isDisabled = levelNum <= project.progressLevel;
                    const isCompleted = levelNum === 5;

                    return (
                      <div
                        key={level}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          isDisabled
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                        onClick={() => !isDisabled && setSelectedLevel(levelNum)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getProgressColor(levelNum)}`}>
                              {levelNum}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{data.status}</h3>
                              <p className="text-sm text-gray-600">{data.percentage}% Complete</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                Current
                              </span>
                            )}
                            {isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {!isDisabled && isSelected && (
                              <div className="w-4 h-4 rounded-full bg-primary-600"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleProgressUpdate}
                  disabled={updating || selectedLevel <= project.progressLevel}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Progress
                    </>
                  )}
                </button>

                {selectedLevel > project.progressLevel && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      Progress will be updated to {progressLevels[selectedLevel]?.status} ({progressLevels[selectedLevel]?.percentage}%)
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
