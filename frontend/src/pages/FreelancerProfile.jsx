import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award,
  FileText,
  Upload,
  X,
  Plus,
  Edit2,
  Save,
  Camera,
  Star,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { freelancerAPI } from '../api';
import { toast } from 'react-hot-toast';

const FreelancerProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    personalInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      bio: '',
      title: 'Full Stack Developer',
      upiId: '' // Add UPI ID field
    },
    professionalInfo: {
      experience: '',
      hourlyRate: '',
      availability: 'full-time',
      languages: ['English'],
      education: '',
      portfolio: '',
      linkedin: '',
      github: ''
    },
    skills: [],
    projects: [],
    stats: {
      completedProjects: 0,
      totalEarnings: 0,
      successRate: 0,
      totalClients: 0
    },
    resume: null,
    profileImage: null
  });

  // Form inputs for editing
  const [formData, setFormData] = useState(profile);

  // Update formData when profile changes
  useEffect(() => {
    setFormData(profile);
  }, [profile]);
  const [newSkill, setNewSkill] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: [],
    link: '',
    completedAt: ''
  });

  // File input refs
  const resumeInputRef = useRef(null);
  const profileImageInputRef = useRef(null);

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      console.log('=== LOADING PROFILE FROM MONGODB ===');
      console.log('User ID:', user?.id);
      console.log('User role:', user?.role);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('User data:', user);
      
      if (!token) {
        console.log('No token found, user not logged in');
        toast.error('Please log in to view your profile');
        return;
      }
      
      console.log('Making API calls to MongoDB...');
      const [profileResponse, statsResponse] = await Promise.all([
        freelancerAPI.getProfile(),
        freelancerAPI.getStats()
      ]);
      
      console.log('=== RAW API RESPONSES ===');
      console.log('Profile response:', profileResponse);
      console.log('Stats response:', statsResponse);
      console.log('Profile response type:', typeof profileResponse);
      console.log('Profile response success:', profileResponse?.success);
      console.log('Profile response data:', profileResponse?.data);
      
      // Extract actual data from response
      const profileData = profileResponse?.data || profileResponse || {};
      const statsData = statsResponse?.data || statsResponse || {};
      
      console.log('=== EXTRACTED DATA ===');
      console.log('Profile data:', profileData);
      console.log('Stats data:', statsData);
      console.log('Profile data type:', typeof profileData);
      console.log('Profile data keys:', Object.keys(profileData || {}));
      console.log('Profile data values:', Object.values(profileData || {}));
      
      // Check if data is empty or undefined
      if (!profileData || Object.keys(profileData || {}).length === 0) {
        console.log('⚠️ PROFILE DATA IS EMPTY OR UNDEFINED!');
        console.log('Available keys:', Object.keys(profileData || {}));
        console.log('Profile data:', profileData);
        
        // Use default data if API returns empty
        const defaultProfile = {
          personalInfo: {
            name: user?.name || '',
            email: user?.email || '',
            phone: '',
            location: '',
            bio: '',
            title: 'Full Stack Developer',
            upiId: ''
          },
          professionalInfo: {
            experience: '',
            hourlyRate: '',
            availability: 'full-time',
            languages: ['English'],
            education: '',
            portfolio: '',
            linkedin: '',
            github: ''
          },
          skills: [],
          projects: [],
          stats: {
            completedProjects: 0,
            totalEarnings: 0,
            successRate: 0,
            totalClients: 0
          },
          resume: null,
          profileImage: null
        };
        
        console.log('Using default profile:', defaultProfile);
        setProfile(defaultProfile);
        setFormData(defaultProfile);
      } else {
        console.log('✅ Profile data loaded successfully');
        
        // Merge with default structure to ensure all fields exist
        const mergedProfile = {
          personalInfo: {
            name: profileData.personalInfo?.name || user?.name || '',
            email: profileData.personalInfo?.email || user?.email || '',
            phone: profileData.personalInfo?.phone || '',
            location: profileData.personalInfo?.location || '',
            bio: profileData.personalInfo?.bio || '',
            title: profileData.personalInfo?.title || 'Full Stack Developer',
            upiId: profileData.personalInfo?.upiId || '' // Make sure UPI ID is included
          },
          professionalInfo: {
            experience: profileData.professionalInfo?.experience || '',
            hourlyRate: profileData.professionalInfo?.hourlyRate || '',
            availability: profileData.professionalInfo?.availability || 'full-time',
            languages: profileData.professionalInfo?.languages || ['English'],
            education: profileData.professionalInfo?.education || '',
            portfolio: profileData.professionalInfo?.portfolio || '',
            linkedin: profileData.professionalInfo?.linkedin || '',
            github: profileData.professionalInfo?.github || ''
          },
          skills: profileData.skills || [],
          projects: profileData.projects || [],
          stats: statsData || profileData.stats || {
            completedProjects: 0,
            totalEarnings: 0,
            successRate: 0,
            totalClients: 0
          },
          resume: profileData.resume || null,
          profileImage: profileData.profileImage || null
        };
        
        console.log('Merged profile:', mergedProfile);
        console.log('UPI ID in merged profile:', mergedProfile.personalInfo.upiId);
        
        setProfile(mergedProfile);
        setFormData(mergedProfile);
        
        console.log('Profile and formData set successfully from MongoDB');
      }
      
      console.log('Profile and formData set successfully from MongoDB');
    } catch (error) {
      console.error('Failed to load profile data from MongoDB:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to access your profile');
      } else {
        toast.error('Failed to load profile data. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: newSkill.trim(), level: 'intermediate' }]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSkillLevel = (index, level) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, level } : skill
      )
    }));
  };

  const handleAddProject = () => {
    if (newProject.title && newProject.description) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, { ...newProject, id: Date.now() }]
      }));
      setNewProject({
        title: '',
        description: '',
        technologies: [],
        link: '',
        completedAt: ''
      });
    }
  };

  const handleRemoveProject = (id) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const handleFileUpload = async (type, file) => {
    if (file) {
      // Validate file type and size
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = type === 'resume' 
        ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type. Please upload a ${type === 'resume' ? 'PDF or Word document' : 'valid image file'}.`);
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB.');
        return;
      }

      try {
        setIsLoading(true);
        
        // Upload to MongoDB
        if (type === 'resume') {
          await freelancerAPI.uploadResume(file);
          setFormData(prev => ({ ...prev, resume: file }));
          toast.success('Resume uploaded to MongoDB successfully!');
        } else if (type === 'profileImage') {
          await freelancerAPI.uploadProfileImage(file);
          setFormData(prev => ({ ...prev, profileImage: file }));
          toast.success('Profile image uploaded to MongoDB successfully!');
        }
      } catch (error) {
        console.error(`Error uploading ${type} to MongoDB:`, error);
        toast.error(`Failed to upload ${type}. Please check your connection and try again.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResumeClick = () => {
    resumeInputRef.current?.click();
  };

  const handleProfileImageClick = () => {
    console.log('Profile image clicked');
    console.log('profileImageInputRef.current:', profileImageInputRef.current);
    
    // Try ref first, then fallback to getElementById
    if (profileImageInputRef.current) {
      profileImageInputRef.current.click();
    } else {
      const fileInput = document.getElementById('profile-image-input');
      if (fileInput) {
        fileInput.click();
      } else {
        console.error('Neither ref nor getElementById found the file input');
      }
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload('resume', file);
    }
  };

  const handleProfileImageChange = (e) => {
    console.log('Profile image change triggered');
    const file = e.target.files[0];
    console.log('Selected file:', file);
    if (file) {
      handleFileUpload('profileImage', file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      console.log('=== SAVING FREELANCER PROFILE ===');
      console.log('Form data being saved:', formData);
      console.log('UPI ID in form data:', formData.personalInfo.upiId);
      console.log('UPI ID type:', typeof formData.personalInfo.upiId);
      console.log('UPI ID length:', formData.personalInfo.upiId?.length);
      
      // Prepare data for API
      const profileData = {
        personalInfo: formData.personalInfo,
        professionalInfo: formData.professionalInfo,
        skills: formData.skills,
        projects: formData.projects
      };
      
      console.log('Profile data being sent to API:', profileData);
      console.log('UPI ID in profile data:', profileData.personalInfo.upiId);
      
      // Save to MongoDB
      const response = await freelancerAPI.updateProfile(profileData);
      console.log('API response from updateProfile:', response);
      console.log('API response status:', response?.success);
      console.log('API response data:', response?.data);
      console.log('UPI ID in response data:', response?.data?.personalInfo?.upiId);
      
      if (response?.success || response?.data) {
        setProfile(formData);
        setIsEditing(false);
        toast.success('Profile updated successfully in MongoDB!');
        console.log('✅ Profile saved successfully');
        console.log('✅ UPI ID should now be:', formData.personalInfo.upiId);
      } else {
        console.error('❌ API returned error response:', response);
        toast.error('Failed to update profile. Please check your connection and try again.');
      }
      
    } catch (error) {
      console.error('❌ Failed to update profile in MongoDB:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error config:', error.config);
      
      toast.error('Failed to update profile. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-700';
      case 'advanced': return 'bg-blue-100 text-blue-700';
      case 'intermediate': return 'bg-green-100 text-green-700';
      case 'beginner': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your professional information and showcase your skills</p>
            </div>
            <div className="flex gap-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-75"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                {isEditing ? (
                  <>
                    <div
                      onClick={handleProfileImageClick}
                      className="relative group cursor-pointer"
                    >
                      {formData.profileImage ? (
                        <img
                          src={URL.createObjectURL(formData.profileImage)}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold group-hover:opacity-90 transition-opacity">
                          {formData.personalInfo.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {/* Hidden file input for profile image */}
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      id="profile-image-input"
                    />
                  </>
                ) : (
                  <div>
                    {formData.profileImage ? (
                      <img
                        src={URL.createObjectURL(formData.profileImage)}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {formData.personalInfo.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.personalInfo.name}
                    onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-primary-500 outline-none pb-1 w-full"
                    placeholder="Your name"
                  />
                  <input
                    type="text"
                    value={formData.personalInfo.title}
                    onChange={(e) => handleInputChange('personalInfo', 'title', e.target.value)}
                    className="text-lg text-gray-600 border-b border-gray-300 focus:border-primary-500 outline-none pb-1 w-full"
                  />
                  <textarea
                    value={formData.personalInfo.bio}
                    onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
                    className="text-gray-700 border border-gray-300 rounded-lg p-3 w-full resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.personalInfo.name}</h2>
                  <p className="text-lg text-gray-600 mb-4">{profile.personalInfo.title}</p>
                  <p className="text-gray-700">{profile.personalInfo.bio}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Contact & Professional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />
                ) : (
                  <span className="text-gray-700">{profile.personalInfo.email}</span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.personalInfo.upiId}
                      onChange={(e) => handleInputChange('personalInfo', 'upiId', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Enter your UPI ID (e.g., user@upi)"
                    />
                  </div>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.professionalInfo.location}
                    onChange={(e) => handleInputChange('professionalInfo', 'location', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Add location"
                  />
                ) : (
                  <span className="text-gray-700">{profile.professionalInfo.location || 'Not provided'}</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Professional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Experience</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.professionalInfo.experience}
                      onChange={(e) => handleInputChange('professionalInfo', 'experience', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., 5+ years"
                    />
                  ) : (
                    <div className="text-gray-700">{profile.professionalInfo.experience || 'Not specified'}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Hourly Rate</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.professionalInfo.hourlyRate}
                      onChange={(e) => handleInputChange('professionalInfo', 'hourlyRate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., ₹750"
                    />
                  ) : (
                    <div className="text-gray-700">{profile.professionalInfo.hourlyRate || 'Not specified'}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Availability</div>
                  {isEditing ? (
                    <select
                      value={formData.professionalInfo.availability}
                      onChange={(e) => handleInputChange('professionalInfo', 'availability', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  ) : (
                    <div className="text-gray-700 capitalize">{profile.professionalInfo.availability}</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Skills</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(isEditing ? formData.skills : profile.skills).map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(skill.level)}`}>
                    {skill.name}
                  </span>
                  {isEditing && (
                    <select
                      value={skill.level}
                      onChange={(e) => handleUpdateSkillLevel(index, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Add a new skill"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
