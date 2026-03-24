import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI, paymentAPI, testExport, freelancerAPI } from '../api';
import toast from 'react-hot-toast';

console.log('Test export:', testExport);

const ProjectPayments = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log('🚀 ProjectPayments Component Initializing...');
  console.log('🚀 Project ID:', id);
  console.log('🚀 User:', user);
  console.log('🚀 Current URL:', window.location.href);
  console.log('🚀 Timestamp:', new Date().toISOString());
  
  // Clear any cached freelancer profile data
  console.log('🧹 Clearing any cached freelancer profile data...');
  localStorage.removeItem('freelancerProfile');
  sessionStorage.removeItem('freelancerProfile');
  
  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [payableInfo, setPayableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [freelancerProfile, setFreelancerProfile] = useState(null);

  // Log initial freelancer profile state
  console.log('🚀 Initial freelancer profile state:', freelancerProfile);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      console.log('🔄 STARTING PROJECT DATA LOAD...');
      console.log('Loading project data for ID:', id);
      
      // Load project details
      const projectResponse = await projectAPI.getProjectDetails(id);
      console.log('Project response:', projectResponse);
      
      if (projectResponse.success) {
        console.log('✅ Project response success!');
        console.log('Raw project response:', projectResponse);
        console.log('Project data:', projectResponse.data);
        console.log('Project allocatedTo:', projectResponse.data?.allocatedTo);
        
        setProject(projectResponse.data);
        console.log('✅ Project state set successfully');
      } else {
        console.error('❌ Project response failed:', projectResponse);
        toast.error(projectResponse.message || 'Failed to load project');
        // Redirect to dashboard if project not found
        navigate('/recruiter/dashboard');
      }

      // Load payable amount for current milestone
      const payableResponse = await paymentAPI.getPayableAmount(id);
      console.log('Payable amount response:', payableResponse);
      
      if (payableResponse.success) {
        console.log('Setting payable info:', payableResponse.data);
        setPayableInfo(payableResponse.data);
      }
    } catch (error) {
      console.error('❌ Error loading project data:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 404) {
        toast.error('Project not found');
        navigate('/recruiter/dashboard');
      } else {
        toast.error('Failed to load project data');
      }
    } finally {
      setLoading(false);
      console.log('✅ Project data loading completed');
    }
  };

  const createMilestonesForProject = async () => {
    try {
      console.log('Starting milestone initialization for project:', id);
      toast.loading('Initializing milestones...');
      
      const response = await paymentAPI.initializeMilestones(id);
      console.log('Milestone initialization response:', response);
      
      if (response.success) {
        toast.success('Milestones initialized successfully');
        
        // Reload milestones after creation
        const paymentsResponse = await paymentAPI.getProjectPayments(id);
        console.log('Payments response after milestone creation:', paymentsResponse);
        
        if (paymentsResponse.success) {
          setMilestones(paymentsResponse.data.milestones);
          console.log('Milestones set:', paymentsResponse.data.milestones);
        }
      } else {
        toast.error(response.message || 'Failed to initialize milestones');
      }
    } catch (error) {
      console.error('Error creating milestones:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to initialize milestones');
    }
  };

  const handleResetPayment = async () => {
    console.log('=== RESET PAYMENT CLICKED ===');
    try {
      // Call backend to reset payment status for testing
      const response = await fetch(`/api/v1/payments/reset/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        console.log('✅ Payment reset successfully');
        toast.success('Payment status reset successfully!');
        // Reload payable info
        loadProjectData();
      } else {
        console.log('❌ Failed to reset payment');
        toast.error('Failed to reset payment status');
      }
    } catch (error) {
      console.error('Error resetting payment:', error);
      toast.error('Error resetting payment status');
    }
  };

  const handlePayment = async () => {
    console.log('=== PAYMENT BUTTON CLICKED ===');
    console.log('Pay Now button clicked!');
    
    // Check if already processing
    if (processingPayment) {
      console.log('Payment already processing, ignoring click');
      return;
    }
    
    console.log('Payable info:', payableInfo);
    console.log('Payment exists:', payableInfo?.paymentExists);
    console.log('Payment status:', payableInfo?.paymentStatus);
    console.log('Freelancer UPI ID:', freelancerProfile?.personalInfo?.upiId);
    console.log('Amount to pay:', payableInfo?.payableAmount);
    console.log('All checks passed:', !payableInfo.paymentExists && payableInfo.payableAmount > 0 && freelancerProfile?.personalInfo?.upiId);
    
    if (!payableInfo) {
      console.log('❌ No payable info available');
      toast.error('Payment information not available');
      return;
    }
    
    if (payableInfo.paymentExists) {
      console.log('❌ Payment already exists');
      toast.error('Payment already completed');
      return;
    }
    
    if (payableInfo.payableAmount === 0) {
      console.log('❌ No amount to pay');
      toast.error('No payment required');
      return;
    }

    if (!freelancerProfile?.personalInfo?.upiId) {
      console.log('❌ No UPI ID found');
      toast.error('Freelancer has not added their UPI ID yet. Please ask the freelancer to add their UPI ID in their profile.', {
        duration: 6000,
        icon: '⚠️'
      });
      return;
    }

    console.log('✅ All checks passed, starting payment...');
    setProcessingPayment(true);
    
    try {
      // 1) Fetch key id (safe to expose key_id)
      const keyRes = await paymentAPI.getRazorpayKey();
      const keyId = keyRes?.data?.keyId;
      if (!keyId) {
        toast.error('Razorpay key is not configured on server');
        return;
      }

      // 2) Create an order on backend for this milestone
      const orderRes = await paymentAPI.createPaymentOrder(id, payableInfo.currentLevel);
      const order = orderRes?.data?.razorpayOrder;
      if (!order?.id) {
        toast.error('Failed to create Razorpay order');
        return;
      }

      // 3) Load Razorpay checkout.js if needed
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HireMinds',
        description: `Milestone payment for ${project.title}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await paymentAPI.verifyPayment(response);
            if (verifyRes?.success) {
              toast.success(`✅ Payment successful: ₹${payableInfo.payableAmount.toLocaleString()}`);
              setPayableInfo({
                ...payableInfo,
                paymentExists: true,
                paymentStatus: 'PAID'
              });
              setTimeout(() => loadProjectData(), 1200);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error(err?.response?.data?.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || 'Recruiter',
          email: user?.email || 'recruiter@example.com'
        },
        notes: {
          projectId: id,
          milestoneLevel: payableInfo.currentLevel,
          freelancerUpi: freelancerProfile?.personalInfo?.upiId || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error?.response?.data?.error || 'Failed to start payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Razorpay Checkout is intentionally not used for recruiter->freelancer payouts.

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-700 bg-green-100';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100';
      case 'FAILED':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getReleasedStatusColor = (status) => {
    switch (status) {
      case 'RELEASED':
        return 'text-green-700 bg-green-100';
      case 'HELD':
        return 'text-blue-700 bg-blue-100';
      case 'FAILED':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const loadFreelancerProfileForUser = async (freelancerId) => {
    try {
      console.log('=== LOADING REAL FREELANCER PROFILE ===');
      console.log('Freelancer ID:', freelancerId);
      console.log('Freelancer ID type:', typeof freelancerId);
      
      if (!freelancerId) {
        console.log('❌ No freelancer ID provided');
        setFreelancerProfile(null);
        return;
      }
      
      // Use new API to get specific freelancer profile by ID
      console.log('Making API call to get REAL freelancer profile by ID...');
      console.log('API URL:', `/api/v1/freelancer/profile/${freelancerId}`);
      
      const response = await freelancerAPI.getProfileById(freelancerId);
      console.log('API response from getProfileById:', response);
      
      // Extract actual data from response
      const freelancerData = response?.data || response || {};
      console.log('✅ Extracted freelancer data:', freelancerData);
      console.log('✅ Freelancer personalInfo:', freelancerData?.personalInfo);
      console.log('✅ Freelancer UPI ID:', freelancerData?.personalInfo?.upiId);
      
      if (freelancerData?.personalInfo?.upiId) {
        console.log('🎉 REAL UPI ID FOUND:', freelancerData.personalInfo.upiId);
        console.log('🎉 Using freelancer\'s actual UPI ID for payment!');
        setFreelancerProfile(freelancerData);
        return;
      } else {
        console.log('⚠️ Freelancer has not added UPI ID in their profile');
        console.log('⚠️ Freelancer needs to add UPI ID in their profile section');
        setFreelancerProfile(freelancerData);
        return;
      }
      
    } catch (error) {
      console.error('❌ Error loading real freelancer profile:', error);
      console.error('❌ Error details:', error.message);
      
      // Set profile without UPI ID
      setFreelancerProfile({
        personalInfo: {
          name: 'Freelancer',
          email: 'freelancer@test.com',
          upiId: null
        }
      });
    }
  };

  const loadFreelancerProfile = async () => {
    try {
      console.log('=== LOADING FREELANCER PROFILE ===');
      console.log('Project allocatedTo:', project?.allocatedTo);
      console.log('Project object:', project);
      console.log('Project allocatedTo type:', typeof project?.allocatedTo);
      
      if (!project?.allocatedTo) {
        console.log('❌ No allocatedTo found in project');
        setFreelancerProfile(null);
        return;
      }
      
      await loadFreelancerProfileForUser(project.allocatedTo);
      
    } catch (error) {
      console.error('Error in loadFreelancerProfile:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 COMPONENT MOUNTED - Loading project data...');
    loadProjectData();
  }, [id]);

  useEffect(() => {
    console.log('=== PROJECT STATE CHANGED ===');
    console.log('Project:', project);
    console.log('Project allocatedTo:', project?.allocatedTo);
    console.log('Project type:', typeof project);
    console.log('AllocatedTo type:', typeof project?.allocatedTo);
    
    if (project && project.allocatedTo) {
      console.log('🔄 Project loaded, loading freelancer profile...');
      
      // Extract freelancer ID from object
      let freelancerId;
      if (typeof project.allocatedTo === 'string') {
        freelancerId = project.allocatedTo;
      } else if (typeof project.allocatedTo === 'object' && project.allocatedTo._id) {
        freelancerId = project.allocatedTo._id;
      } else if (typeof project.allocatedTo === 'object' && project.allocatedTo.id) {
        freelancerId = project.allocatedTo.id;
      }
      
      console.log('Extracted freelancer ID:', freelancerId);
      console.log('Calling loadFreelancerProfileForUser with:', freelancerId);
      
      if (freelancerId) {
        loadFreelancerProfileForUser(freelancerId);
      } else {
        console.log('❌ Could not extract freelancer ID from allocatedTo');
      }
    } else {
      console.log('⚠️ Project or allocatedTo not available yet');
      console.log('Project exists:', !!project);
      console.log('AllocatedTo exists:', !!project?.allocatedTo);
    }
  }, [project]);

  useEffect(() => {
    console.log('=== FREELANCER PROFILE STATE CHANGED ===');
    console.log('Freelancer profile:', freelancerProfile);
    console.log('UPI ID:', freelancerProfile?.personalInfo?.upiId);
  }, [freelancerProfile]);

  if (loading) {
    console.log('🔄 Component is in loading state...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
          <p className="text-sm text-gray-500 mt-2">Project ID: {id}</p>
        </div>
      </div>
    );
  }

  console.log('✅ Component finished loading, rendering content...');
  console.log('Project:', project);
  console.log('Freelancer profile:', freelancerProfile);

  if (!project) {
    console.log('❌ No project data found');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <p className="text-gray-600 mb-4">Project ID: {id}</p>
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              console.log('🧪 Test button clicked!');
              console.log('Current state:', { project, freelancerProfile, loading });
              alert('Test button clicked! Check console for state info.');
            }}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Test State
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering main content with project:', project);
  console.log('✅ Freelancer profile:', freelancerProfile);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/recruiter/dashboard')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {/* Reset Payment Button for Testing */}
              <button
                onClick={handleResetPayment}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <span>Reset Payment (Testing)</span>
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Payments</h1>
              <p className="text-gray-600">{project.title}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Project Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{project.budget ? project.budget.toLocaleString() : 
                       (project.acceptedBid?.bidAmount ? project.acceptedBid.bidAmount.toLocaleString() : '0')}
                  </p>
                  {project.budget && (
                    <p className="text-xs text-gray-500 mt-1">Project budget</p>
                  )}
                  {(!project.budget && project.acceptedBid?.bidAmount) && (
                    <p className="text-xs text-gray-500 mt-1">Based on accepted bid</p>
                  )}
                  {(!project.budget && !project.acceptedBid?.bidAmount) && (
                    <div className="mt-2">
                      <p className="text-xs text-red-500 mb-2">No budget set</p>
                      <button
                        onClick={() => {
                          const testBudget = 20000;
                          setProject({...project, budget: testBudget});
                          toast.success(`Test budget of ₹${testBudget.toLocaleString()} set for demonstration`);
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Set Test Budget (₹20,000)
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {project.progressLevel || 0}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {project.projectStatus === 'Completed' ? '🎉 Project Completed!' : project.projectStatus || 'Not Started'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Completion</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{project.completionPercentage || 0}%</p>
                </div>
              </div>

              {/* Current Milestone Payment */}
              {payableInfo && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Current Milestone Payment</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Milestone:</span>
                      <span className="text-sm font-medium">{payableInfo.currentMilestoneStatus || 'Loading...'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Level:</span>
                      <span className="text-sm font-medium">{payableInfo.currentLevel || 'Loading...'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Progress:</span>
                      <span className="text-sm font-medium">{payableInfo.currentPercentage || 0}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount Due:</span>
                      <span className="text-sm font-bold text-blue-600">
                        ₹{payableInfo.payableAmount ? payableInfo.payableAmount.toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Freelancer UPI ID Display */}
                  {freelancerProfile?.personalInfo?.upiId && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Freelancer UPI ID (reference):</p>
                          <p className="text-lg font-bold text-green-700">{freelancerProfile.personalInfo.upiId}</p>
                        </div>
                        <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✓ Verified
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Razorpay checkout QR is your merchant collection QR, not this freelancer UPI ID.
                      </p>
                    </div>
                  )}

                  {payableInfo.isCompleted ? (
                    <div className="mt-4 p-2 bg-green-100 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        🎉 Project Completed! 
                        {payableInfo.payableAmount > 0 ? (
                          <span> Remaining amount to pay: <strong>₹{payableInfo.payableAmount.toLocaleString()}</strong></span>
                        ) : (
                          <span>All milestones have been paid! ✅</span>
                        )}
                      </p>
                    </div>
                  ) : !payableInfo.isCompleted && payableInfo.payableAmount > 0 && (
                    <div className="space-y-2">
                      <button
                        onClick={handlePayment}
                        disabled={processingPayment}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <IndianRupee className="w-4 h-4" />
                            <span>Pay via Razorpay Checkout</span>
                          </>
                        )}
                      </button>
                      
                      {/* Debug button to test click handler */}
                      <button
                        onClick={() => {
                          console.log('🔥 PAYMENT BUTTON CLICKED - DEBUG!');
                          console.log('Button disabled:', processingPayment || !payableInfo || payableInfo.paymentExists || payableInfo.payableAmount === 0 || !freelancerProfile?.personalInfo?.upiId);
                          console.log('Payable info exists:', !!payableInfo);
                          console.log('Payment exists:', payableInfo?.paymentExists);
                          console.log('Payable amount:', payableInfo?.payableAmount);
                          console.log('UPI ID exists:', !!freelancerProfile?.personalInfo?.upiId);
                          alert('Payment button clicked! Check console for debug info.');
                        }}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm mt-2"
                      >
                        🔧 Debug Payment Button
                      </button>
                    </div>
                  )}

                  {!payableInfo.isCompleted && payableInfo.payableAmount === 0 && (
                    <div className="mt-4 p-2 bg-yellow-100 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        {payableInfo.message || 'No payment required'}
                      </p>
                    </div>
                  )}

                  {payableInfo.paymentExists && payableInfo.paymentStatus !== 'FAILED' && (
                    <div className="mt-4 p-2 bg-green-100 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        {payableInfo.paymentStatus === 'PAID' ? '✅ Payment completed' : '⏳ Payment already initiated'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Milestones & Payments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Milestones & Payments</h2>
              
              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Milestones Found</h3>
                    <p className="text-gray-600 mb-6">
                      This project doesn't have milestones set up yet. Initialize milestones to enable milestone-based payments.
                    </p>
                  </div>
                  
                  <button
                    onClick={createMilestonesForProject}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    <Target className="w-5 h-5" />
                    Initialize Milestones
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => {
                    const payment = payments.find(p => p.milestone._id === milestone._id);
                    const isCurrent = milestone.level === project.progressLevel;
                    const isCompleted = milestone.level < project.progressLevel;
                    
                    return (
                      <div
                        key={milestone._id}
                        className={`border-2 rounded-lg p-4 ${
                          isCurrent ? 'border-blue-500 bg-blue-50' : 
                          isCompleted ? 'border-green-500 bg-green-50' : 
                          'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              milestone.level === 0 ? 'bg-blue-500' :
                              milestone.level === 1 ? 'bg-indigo-500' :
                              milestone.level === 2 ? 'bg-purple-500' :
                              milestone.level === 3 ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}>
                              {milestone.level}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{milestone.status}</h3>
                              <p className="text-sm text-gray-600">
                                {milestone.percentage}% • ₹{
                                  milestone.amount ? milestone.amount.toLocaleString() :
                                  ((project.budget || project.acceptedBid?.bidAmount || 0) * milestone.percentage / 100).toLocaleString()
                                }
                              </p>
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
                          </div>
                        </div>
                        
                        {payment && (
                          <div className="border-t pt-3 mt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Payment Status</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(payment.transactionStatus)}`}>
                                  {payment.transactionStatus}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Release Status</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getReleasedStatusColor(payment.releasedStatus)}`}>
                                  {payment.releasedStatus}
                                </span>
                              </div>
                            </div>
                            
                            {payment.paidAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Paid on: {new Date(payment.paidAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPayments;
