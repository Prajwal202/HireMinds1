import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  Briefcase,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../api';
import toast from 'react-hot-toast';

const ProjectProgress = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [progressLevels, setProgressLevels] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);

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
        toast.success(response.message || 'Project progress updated successfully');
        setProject(prev => ({
          ...prev,
          progressLevel: response.progressLevel,
          completionPercentage: response.completionPercentage,
          projectStatus: response.projectStatus
        }));
        
        // Check if project was just completed
        if (response.progressLevel === 5) {
          setJustCompleted(true);
          // Redirect after a delay to show success
          setTimeout(() => {
            navigate(`/projects/${id}`);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(error.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdating(false);
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

  const getProgressBgColor = (level) => {
    if (level === 0) return 'bg-gray-100 border-gray-200';
    if (level === 1) return 'bg-blue-50 border-blue-200';
    if (level === 2) return 'bg-indigo-50 border-indigo-200';
    if (level === 3) return 'bg-purple-50 border-purple-200';
    if (level === 4) return 'bg-orange-50 border-orange-200';
    if (level === 5) return 'bg-green-50 border-green-200';
    return 'bg-gray-100 border-gray-200';
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

  const canUpdateProgress = user.role === 'freelancer' && 
                           project.allocatedTo?._id === user.id && 
                           project.progressLevel < 5;

  // Show completion success screen if project was just completed
  if (justCompleted || project.progressLevel >= 5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Project Completed! 🎉
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 mb-6"
          >
            Congratulations! You have successfully completed this project. 
            The project status has been updated to 100% completion.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            <Link
              to={`/projects/${id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <Target className="w-5 h-5" />
              View Project Details
            </Link>
            <div>
              <Link
                to="/freelancer/dashboard"
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
          {!justCompleted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-gray-500 mt-4"
            >
              This project is already completed. No further progress updates are needed.
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  if (!canUpdateProgress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to update this project's progress.</p>
          <Link to="/freelancer/dashboard" className="text-primary-600 hover:text-primary-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              to={`/projects/${id}`}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Update Project Progress</h1>
              <p className="text-gray-600 mt-1">{project.title}</p>
            </div>
          </div>
        </motion.div>

        {/* Project Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Project Summary</h2>
            <span className="text-sm text-gray-500">
              Current Level: {project.progressLevel}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium text-gray-900">{project.postedBy?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-medium text-gray-900">{project.projectStatus}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="font-medium text-gray-900">{project.completionPercentage}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Levels */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Select Progress Level</h2>
          
          <div className="space-y-3">
            {Object.entries(progressLevels).map(([level, data]) => {
              const levelNum = parseInt(level);
              const isCurrent = levelNum === project.progressLevel;
              const isSelected = levelNum === selectedLevel;
              const isDisabled = levelNum <= project.progressLevel;
              const isCompleted = levelNum === 5;

              return (
                <div
                  key={level}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !isDisabled && setSelectedLevel(levelNum)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getProgressColor(levelNum)}`}>
                        {levelNum}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{data.status}</h3>
                        <p className="text-sm text-gray-600">{data.percentage}% Complete</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Current
                        </span>
                      )}
                      {isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      {!isDisabled && isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && !isDisabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-gray-200"
                    >
                      <p className="text-sm text-gray-600">
                        You are about to update the project to <strong>{data.status}</strong> ({data.percentage}% completion).
                      </p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleProgressUpdate}
              disabled={updating || selectedLevel <= project.progressLevel}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating Progress...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update to {progressLevels[selectedLevel]?.status}
                </>
              )}
            </button>

            {selectedLevel > project.progressLevel && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Progress Update Summary
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      From: {progressLevels[project.progressLevel]?.status} ({project.completionPercentage}%)<br/>
                      To: {progressLevels[selectedLevel]?.status} ({progressLevels[selectedLevel]?.percentage}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedLevel <= project.progressLevel && selectedLevel !== 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Cannot Move Backwards
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      You can only move forward in progress. Please select a higher level.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectProgress;
