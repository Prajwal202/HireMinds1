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
  Target,
  Send,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI, paymentAPI, testExport, freelancerAPI } from '../api';
import toast from 'react-hot-toast';
import UPIQRCode from '../components/UPIQRCode';

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
  // Add state for manual UPI ID input
  const [manualUpiId, setManualUpiId] = useState('');
  const [showManualUpiInput, setShowManualUpiInput] = useState(false);
  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showTransactionInput, setShowTransactionInput] = useState(true); // Always show by default
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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
      
      // Load project payments
      const paymentsResponse = await paymentAPI.getProjectPayments(id);
      console.log('Project payments response:', paymentsResponse);
      
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data?.payments || []);
        console.log('Payments set:', paymentsResponse.data?.payments || []);
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
      setLastUpdated(new Date()); // Update last refreshed time
      console.log('✅ Project data load completed at:', new Date().toLocaleTimeString());
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
    
    // Check if current milestone has been paid
    const currentMilestonePaid = payableInfo?.paymentExists || false;
    setPaymentCompleted(currentMilestonePaid);
    
    console.log('💰 Payment status check:', {
      paymentExists: payableInfo?.paymentExists,
      currentLevel: payableInfo?.currentLevel,
      totalLevels: payableInfo?.totalLevels,
      isCompleted: currentMilestonePaid
    });
    
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

  const handleRecordUPIPayment = async () => {
    console.log('🔍 handleRecordUPIPayment called:', {
      transactionId,
      freelancerProfile,
      payableInfo,
      'freelancerProfile.upiId': freelancerProfile?.personalInfo?.upiId,
      'payableInfo.payableAmount': payableInfo?.payableAmount
    });

    if (!freelancerProfile?.personalInfo?.upiId) {
      toast.error('Freelancer UPI ID not found');
      return;
    }

    if (!transactionId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    // Calculate the actual amount due based on progress
    const currentPercentage = payableInfo?.currentPercentage || 0;
    const acceptedBidAmount = project.acceptedBid?.bidAmount || project.budget || 0;
    let amountDue = 0;
    
    if (currentPercentage > 0 && currentPercentage <= 25) {
      amountDue = Math.round(acceptedBidAmount * 0.25);
    } else if (currentPercentage > 25 && currentPercentage <= 50) {
      amountDue = Math.round(acceptedBidAmount * 0.25);
    } else if (currentPercentage > 50 && currentPercentage <= 75) {
      amountDue = Math.round(acceptedBidAmount * 0.25);
    } else if (currentPercentage > 75 && currentPercentage <= 100) {
      amountDue = Math.round(acceptedBidAmount * 0.25);
    }

    console.log('💰 Calculated amount for payment:', {
      currentPercentage,
      acceptedBidAmount,
      amountDue
    });

    if (amountDue <= 0) {
      toast.error('No payment due at this progress level');
      return;
    }

    setRecordingPayment(true);
    try {
      // Create payment verification for freelancer to accept
      const verificationData = {
        projectId: id,
        recruiterId: user?.id,
        freelancerId: getFreelancerId(),
        amount: amountDue,
        transactionId: transactionId.trim(),
        upiId: freelancerProfile.personalInfo.upiId,
        projectName: project.title,
        recruiterName: user.name,
        submittedAt: new Date(),
        status: 'PENDING'
      };

      // Save to localStorage for freelancer to verify
      const storedVerifications = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
      storedVerifications.push(verificationData);
      localStorage.setItem('paymentVerifications', JSON.stringify(storedVerifications));

      console.log('💾 Payment verification created:', verificationData);
      
      toast.success(`✅ Payment details submitted! Transaction ID: ${transactionId}. Waiting for freelancer verification.`);
      
      // Update UI to show submitted status
      setTransactionSubmitted(true);
      setTransactionDetails(verificationData);
      
      // Clear transaction ID after successful submission
      setTransactionId('');
      setShowTransactionInput(false);
      
      // Reload project data to update payment status
      await loadProjectData();
      
      console.log('✅ Payment verification submitted successfully');
    } catch (error) {
      console.error('Error submitting payment verification:', error);
      toast.error('Failed to submit payment details');
    } finally {
      setRecordingPayment(false);
    }
  };

  const loadFreelancerProfileForUser = async (freelancerId) => {
    try {
      console.log('🔄 Loading freelancer profile for user:', freelancerId);
      
      // Clear any cached data first
      localStorage.removeItem('freelancerProfile');
      sessionStorage.removeItem('freelancerProfile');
      
      const response = await freelancerAPI.getProfileById(freelancerId);
      console.log('Freelancer profile response:', response);
      
      if (response.success && response.data) {
        setFreelancerProfile(response.data);
        console.log('✅ Freelancer profile loaded successfully:', response.data);
        console.log('✅ Freelancer UPI ID:', response.data?.personalInfo?.upiId);
      } else {
        console.log('❌ Freelancer profile not found or failed to load');
        setFreelancerProfile(null);
      }
    } catch (error) {
      console.error('Error loading freelancer profile:', error);
      setFreelancerProfile(null);
    }
  };

  // Calculate milestone amounts based on accepted bid
  const calculateMilestoneAmounts = () => {
    if (!project) {
      return {
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0,
      };
    }
    
    const acceptedBidAmount = project.acceptedBid?.bidAmount || project.budget || 0;
    
    console.log('💰 Milestone Amounts Calculation:', {
      projectId: project._id,
      acceptedBidAmount,
      projectBudget: project.budget,
      acceptedBid: project.acceptedBid,
      milestoneAmounts: {
        level1: Math.round(acceptedBidAmount * 0.25),
        level2: Math.round(acceptedBidAmount * 0.25),
        level3: Math.round(acceptedBidAmount * 0.25),
        level4: Math.round(acceptedBidAmount * 0.25),
      }
    });
    
    return {
      level1: Math.round(acceptedBidAmount * 0.25),  // 25% - first payment
      level2: Math.round(acceptedBidAmount * 0.25),  // Additional 25% to reach 50%
      level3: Math.round(acceptedBidAmount * 0.25),  // Additional 25% to reach 75%
      level4: Math.round(acceptedBidAmount * 0.25),  // Additional 25% to reach 100%
    };
  };

  const milestoneAmounts = calculateMilestoneAmounts();

  // Get the actual amount for a specific level
  const getLevelAmount = (level) => {
    const acceptedBidAmount = project.acceptedBid?.bidAmount || project.budget || 0;
    
    if (level === 1) return Math.round(acceptedBidAmount * 0.40); // Level 1: 40%
    if (level === 2) return Math.round(acceptedBidAmount * 0.20); // Level 2: 20%
    if (level === 3) return Math.round(acceptedBidAmount * 0.20); // Level 3: 20%
    if (level === 4) return Math.round(acceptedBidAmount * 0.20); // Level 4: 20%
    return 0;
  };

  // Fix payment amounts in localStorage to use correct milestone amounts
  const fixPaymentAmounts = () => {
    const storedVerifications = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
    let updated = false;
    
    const updatedVerifications = storedVerifications.map(v => {
      if (v.projectId === id && v.recruiterId === user?.id && v.status === 'ACCEPTED') {
        // Try to determine the level based on timestamp or sequence
        const projectPayments = storedVerifications.filter(pv => 
          pv.projectId === id && 
          pv.recruiterId === user?.id && 
          pv.status === 'ACCEPTED'
        );
        
        const sortedPayments = [...projectPayments].sort((a, b) => 
          new Date(a.submittedAt) - new Date(b.submittedAt)
        );
        const currentIndex = sortedPayments.findIndex(p => p.transactionId === v.transactionId);
        const level = currentIndex + 1;
        const correctAmount = getLevelAmount(level);
        
        if (v.amount !== correctAmount) {
          console.log('🔧 Fixing payment amount:', {
            transactionId: v.transactionId,
            oldAmount: v.amount,
            newAmount: correctAmount,
            level
          });
          updated = true;
          return { ...v, amount: correctAmount };
        }
      }
      return v;
    });
    
    if (updated) {
      localStorage.setItem('paymentVerifications', JSON.stringify(updatedVerifications));
      console.log('✅ Payment amounts fixed in localStorage');
    }
    
    return updatedVerifications;
  };

  // Extract freelancer ID from object
  const getFreelancerId = () => {
    console.log('🔍 Extracting freelancer ID from project:', project);
    console.log('  project.allocatedTo:', project?.allocatedTo);
    console.log('  typeof allocatedTo:', typeof project?.allocatedTo);
    
    if (typeof project?.allocatedTo === 'string') {
      console.log('  Using string allocatedTo:', project.allocatedTo);
      return project.allocatedTo;
    } else if (typeof project?.allocatedTo === 'object' && project?.allocatedTo._id) {
      console.log('  Using object allocatedTo._id:', project.allocatedTo._id);
      return project.allocatedTo._id;
    } else if (typeof project?.allocatedTo === 'object' && project?.allocatedTo.id) {
      console.log('  Using object allocatedTo.id:', project.allocatedTo.id);
      return project.allocatedTo.id;
    }
    
    console.log('  No valid freelancer ID found');
    return null;
  };

  // Get freelancer UPI ID (handles empty strings)
  const getFreelancerUpiId = () => {
    // First check if manual UPI ID is provided for testing
    if (manualUpiId && manualUpiId.trim() !== "") {
      console.log('🔧 Using manual UPI ID:', manualUpiId);
      return manualUpiId;
    }
    
    // Check all possible UPI ID fields with better logging
    console.log('🔍 Checking UPI ID fields:');
    console.log('  Full freelancer profile:', freelancerProfile);
    console.log('  personalInfo:', freelancerProfile?.personalInfo);
    console.log('  personalInfo.upiId:', freelancerProfile?.personalInfo?.upiId);
    console.log('  upiId:', freelancerProfile?.upiId);
    console.log('  paymentInfo.upiId:', freelancerProfile?.paymentInfo?.upiId);
    console.log('  bankInfo.upiId:', freelancerProfile?.bankInfo?.upiId);
    
    const upiId = freelancerProfile?.personalInfo?.upiId || 
                   freelancerProfile?.upiId || 
                   freelancerProfile?.paymentInfo?.upiId ||
                   freelancerProfile?.bankInfo?.upiId;
    
    console.log('  Final UPI ID:', upiId);
    console.log('  UPI ID type:', typeof upiId);
    console.log('  UPI ID length:', upiId?.length);
    
    // Handle empty string case - treat "" as no UPI ID
    const isValidUpiId = upiId && upiId.trim() !== "";
    console.log('  Is valid UPI ID:', isValidUpiId);
    
    return isValidUpiId ? upiId : null;
  };

  useEffect(() => {
    console.log('=== FREELANCER PROFILE STATE CHANGED ===');
    console.log('Freelancer profile:', freelancerProfile);
    console.log('UPI ID:', freelancerProfile?.personalInfo?.upiId);
    console.log('Effective UPI ID:', getFreelancerUpiId());
  }, [freelancerProfile]);

  useEffect(() => {
    loadProjectData();
  }, []);

  useEffect(() => {
    const freelancerId = getFreelancerId();
    console.log('=== FREELANCER PROFILE LOADING ===');
    console.log('Extracted freelancer ID:', freelancerId);
    console.log('Current user ID:', user?.id);
    console.log('Calling loadFreelancerProfileForUser with:', freelancerId);
    if (freelancerId) {
      loadFreelancerProfileForUser(freelancerId);
    }
  }, [project]);

  useEffect(() => {
    console.log('🔍 Payment completion check starting...');
    
    // Check both backend payments and verification payments
    const backendPaymentExists = payableInfo?.paymentExists || false;
    
    // Also check if there's an accepted verification payment for this project
    const storedVerifications = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
    const projectVerification = storedVerifications.find(v => 
      v.projectId === id && 
      v.recruiterId === user?.id && 
      v.status === 'ACCEPTED'
    );
    
    const verificationPaymentExists = !!projectVerification;
    
    // Check if current milestone is completed based on level
    const currentLevel = payableInfo?.currentLevel || 1;
    const totalLevels = payableInfo?.totalLevels || 4;
    
    // Payment is completed only if:
    // 1. Backend payment exists, OR
    // 2. Verification payment exists, OR
    // 3. Current level equals total levels (project fully completed)
    const projectFullyCompleted = currentLevel >= totalLevels;
    const currentMilestonePaid = backendPaymentExists || verificationPaymentExists || projectFullyCompleted;
    
    console.log('� Detailed payment status:', {
      projectId: id,
      userId: user?.id,
      backendPaymentExists,
      verificationPaymentExists,
      currentLevel,
      totalLevels,
      projectFullyCompleted,
      paymentExists: payableInfo?.paymentExists,
      payableInfo: payableInfo,
      currentMilestonePaid,
      projectVerification,
      storedVerifications: storedVerifications
    });
    
    setPaymentCompleted(currentMilestonePaid);
  }, [payableInfo?.paymentExists, payableInfo?.currentLevel, payableInfo?.totalLevels, id, user?.id]);

  // Auto-refresh data periodically to catch milestone updates (DISABLED)
  useEffect(() => {
    console.log('⏰ Auto-refresh disabled for project:', id);
    
    // Auto-refresh disabled to prevent continuous refreshing
    // const refreshInterval = setInterval(() => {
    //   console.log('⏰ Auto-refreshing project data...');
    //   loadProjectData();
    // }, 10000); // Refresh every 10 seconds

    // return () => {
    //   console.log('⏰ Cleaning up auto-refresh interval');
    //   clearInterval(refreshInterval);
    // };
  }, [id, loadProjectData]);

  // Listen for milestone update events from freelancer
  useEffect(() => {
    console.log('🎧 Setting up milestone update listeners for project:', id);
    
    const handleMilestoneUpdate = (event) => {
      console.log('📞 ProjectPayments received milestone update event:', event.detail);
      
      // Check if this milestone update is for the current project
      if (event.detail.projectId === id) {
        console.log('✅ Milestone update matches current project! Refreshing data...');
        console.log('🔄 Refreshing project data due to milestone update...');
        
        // Reload project data to get the latest level and progress
        loadProjectData();
        
        // Show notification to recruiter
        toast.success(`Milestone updated to Level ${event.detail.currentLevel}!`);
      } else {
        console.log('❌ Milestone update for different project:', event.detail.projectId, 'current:', id);
      }
    };

    // Listen for custom milestone update events
    window.addEventListener('milestoneUpdated', handleMilestoneUpdate);
    
    // Also listen for project status changes
    const handleProjectUpdate = (event) => {
      console.log('📞 ProjectPayments received project update event:', event.detail);
      
      if (event.detail.projectId === id) {
        console.log('✅ Project update matches current project! Refreshing data...');
        console.log('🔄 Refreshing project data due to project update...');
        loadProjectData();
        toast.success('Project status updated!');
      } else {
        console.log('❌ Project update for different project:', event.detail.projectId, 'current:', id);
      }
    };
    
    window.addEventListener('projectUpdated', handleProjectUpdate);

    console.log('🎧 Event listeners setup complete');

    return () => {
      console.log('🧹 Cleaning up event listeners');
      window.removeEventListener('milestoneUpdated', handleMilestoneUpdate);
      window.removeEventListener('projectUpdated', handleProjectUpdate);
    };
  }, [id, loadProjectData]);

  // Listen for payment acceptance events to update payment status
  useEffect(() => {
    const handlePaymentAccepted = (event) => {
      console.log(' ProjectPayments received paymentAccepted event:', event.detail);
      
      // Check if this payment is for the current project
      if (event.detail.recruiterId === user?.id) {
        console.log(' Refreshing payment status for project...');
        
        // Re-check payment status with updated milestone info
        const backendPaymentExists = payableInfo?.paymentExists || false;
        
        const storedVerifications = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
        const projectVerification = storedVerifications.find(v => 
          v.projectId === id && 
          v.recruiterId === user?.id && 
          v.status === 'ACCEPTED'
        );
        
        const verificationPaymentExists = !!projectVerification;
        
        // Check if current milestone is completed based on level
        const currentLevel = payableInfo?.currentLevel || 1;
        const totalLevels = payableInfo?.totalLevels || 3;
        const projectFullyCompleted = currentLevel >= totalLevels;
        
        const currentMilestonePaid = backendPaymentExists || verificationPaymentExists || projectFullyCompleted;
        
        setPaymentCompleted(currentMilestonePaid);
        
        console.log('✅ Payment status updated:', {
          projectId: id,
          backendPaymentExists,
          verificationPaymentExists,
          currentLevel,
          totalLevels,
          projectFullyCompleted,
          isCompleted: currentMilestonePaid
        });
      }
    };

    window.addEventListener('paymentAccepted', handlePaymentAccepted);
    console.log('👂 ProjectPayments listening for paymentAccepted events');

    return () => {
      window.removeEventListener('paymentAccepted', handlePaymentAccepted);
    };
  }, [id, user?.id, payableInfo?.paymentExists, payableInfo?.currentLevel, payableInfo?.totalLevels]);

  // Render loading state
  if (loading) {
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

  // Render project not found state
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <p className="text-gray-600 mb-4">Project ID: {id}</p>
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
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
                  <p className="text-sm text-gray-600">Project Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{project.acceptedBid?.bidAmount ? project.acceptedBid.bidAmount.toLocaleString() : 
                     (project.budget ? project.budget.toLocaleString() : '0')}
                  </p>
                  {project.acceptedBid?.bidAmount && (
                    <p className="text-xs text-green-500 mt-1">Accepted bid amount</p>
                  )}
                  {(!project.acceptedBid?.bidAmount && project.budget) && (
                    <p className="text-xs text-gray-500 mt-1">Project budget</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Project Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {project.projectStatus === 'Completed' ? '🎉 Project Completed!' : project.projectStatus || 'Not Started'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Milestone Payment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Current Milestone Payment</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Milestone:</span>
                  <span className="text-sm font-medium">{payableInfo?.currentMilestoneStatus || 'Loading...'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Level:</span>
                  <span className="text-sm font-medium">{payableInfo?.currentLevel || 'Loading...'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="text-sm font-medium">{(() => {
                      // Use project completion percentage as primary source
                      const percentage = project?.completionPercentage || payableInfo?.currentPercentage || 0;
                      console.log('🔍 Progress Display Debug:', {
                        projectCompletionPercentage: project?.completionPercentage,
                        payableInfoCurrentPercentage: payableInfo?.currentPercentage,
                        finalPercentage: percentage
                      });
                      return `${percentage}%`;
                    })()}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project?.completionPercentage || payableInfo?.currentPercentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {project?.completionPercentage || payableInfo?.currentPercentage || 0}% Complete
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Due:</span>
                  <span className="text-sm font-bold text-blue-600">
                    ₹{(() => {
                      // Use backend percentage directly since it's the correct source
                      const currentPercentage = project?.completionPercentage || payableInfo?.currentPercentage || 0;
                      const acceptedBidAmount = project.acceptedBid?.bidAmount || project.budget || 0;
                      
                      console.log('💰 Simplified Payment Calculation:', {
                        currentPercentage,
                        acceptedBidAmount
                      });
                      
                      // Calculate payment based on actual level completion and payments already made
                      let amountDue = 0;
                      let totalPaid = 0;
                      
                      if (currentPercentage <= 0) {
                        amountDue = 0; // No payment due for 0% progress
                        totalPaid = 0;
                      } else if (currentPercentage <= 40) {
                        // Level 1: 40% completion
                        amountDue = Math.round(acceptedBidAmount * 0.40); // 40% of budget
                        totalPaid = 0; // No payments made yet
                      } else if (currentPercentage <= 60) {
                        // Level 2: 60% completion
                        amountDue = Math.round(acceptedBidAmount * 0.20); // 20% for this level
                        totalPaid = Math.round(acceptedBidAmount * 0.40); // Level 1 already paid
                      } else if (currentPercentage <= 80) {
                        // Level 3: 80% completion
                        amountDue = Math.round(acceptedBidAmount * 0.20); // 20% for this level
                        totalPaid = Math.round(acceptedBidAmount * 0.60); // Levels 1 & 2 already paid (40 + 20)
                      } else if (currentPercentage <= 100) {
                        // Level 4: 100% completion
                        amountDue = Math.round(acceptedBidAmount * 0.20); // 20% for this level
                        totalPaid = Math.round(acceptedBidAmount * 0.80); // Levels 1, 2 & 3 already paid (40 + 20 + 20)
                      }
                      
                      const cumulativeTotal = totalPaid + amountDue;
                      
                      console.log('💰 Final Payment Calculation:', {
                        currentPercentage,
                        amountDue,
                        totalPaid,
                        cumulativeTotal
                      });
                      
                      if (amountDue === 0) {
                        return '0 (No payment due)';
                      }
                      
                      return `${amountDue.toLocaleString()} (Total: ₹${cumulativeTotal.toLocaleString()})`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Payment Interface - Hide if payment completed */}
              {/* Temporarily force show payment interface for debugging */}
              {(() => {
                // Check if there's a payment due for the current level
                const currentPercentage = project?.completionPercentage || payableInfo?.currentPercentage || 0;
                const acceptedBidAmount = project.acceptedBid?.bidAmount || project.budget || 0;
                let amountDue = 0;
                
                if (currentPercentage <= 0) {
                  amountDue = 0;
                } else if (currentPercentage <= 40) {
                  amountDue = Math.round(acceptedBidAmount * 0.40);
                } else if (currentPercentage <= 60) {
                  amountDue = Math.round(acceptedBidAmount * 0.20);
                } else if (currentPercentage <= 80) {
                  amountDue = Math.round(acceptedBidAmount * 0.20);
                } else if (currentPercentage <= 100) {
                  amountDue = Math.round(acceptedBidAmount * 0.20);
                }
                
                // Check if payment for this level already exists
                const storedVerifications = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
                const projectPayments = storedVerifications.filter(v => 
                  v.projectId === id && 
                  v.recruiterId === user?.id && 
                  v.status === 'ACCEPTED'
                );
                
                // Calculate current level based on payments made
                const currentLevel = projectPayments.length + 1;
                
                // Only show payment options if amount due > 0 and we haven't exceeded levels
                // AND if the current percentage level hasn't been paid yet
                const shouldShowPayment = amountDue > 0 && 
                                        currentLevel <= 4 && 
                                        !((currentPercentage <= 40 && projectPayments.length >= 1) ||
                                          (currentPercentage <= 60 && projectPayments.length >= 2) ||
                                          (currentPercentage <= 80 && projectPayments.length >= 3) ||
                                          (currentPercentage <= 100 && projectPayments.length >= 4));
                
                console.log('🔍 Payment Options Logic:', {
                  currentPercentage,
                  amountDue,
                  currentLevel,
                  projectPaymentsCount: projectPayments.length,
                  shouldShowPayment,
                  projectPayments: projectPayments.map(p => ({
                    id: p.id,
                    amount: p.amount,
                    status: p.status,
                    submittedAt: p.submittedAt
                  })),
                  projectId: id,
                  recruiterId: user?.id
                });
                
                return shouldShowPayment;
              })() && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  {getFreelancerUpiId() ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Freelancer UPI ID:</p>
                          <p className="text-lg font-bold text-green-700">{getFreelancerUpiId()}</p>
                        </div>
                        <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✓ Verified
                        </div>
                      </div>
                      
                      {/* Payment Options */}
                      <div className="mt-4 pt-3 border-t border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Choose Payment Method:</p>
                        
                        {/* Payment Option Buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <button
                            onClick={() => setShowUPIPayment(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              !showUPIPayment 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            💳 Razorpay
                          </button>
                          <button
                            onClick={() => setShowUPIPayment(true)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              showUPIPayment 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            📱 Direct UPI
                          </button>
                        </div>
                      </div>

                      {/* Payment Content Based on Selection */}
                      {!showUPIPayment ? (
                        <div className="text-center py-3">
                          <p className="text-xs text-gray-600 mb-2">
                            Pay via Razorpay for secure transaction with payment protection
                          </p>
                          <button
                            onClick={handlePayment}
                            disabled={processingPayment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {processingPayment ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-1"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 inline mr-1" />
                                Pay Now
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <>
                          <UPIQRCode
                            upiId={getFreelancerUpiId()}
                            amount={(() => {
                              const currentPercentage = project?.completionPercentage || payableInfo?.currentPercentage || 0;
                              const acceptedBidAmount = project.acceptedBid?.bidAmount || project.budget || 0;
                              
                              // Use same payment calculation as amount display
                              let amountDue = 0;
                              
                              if (currentPercentage <= 0) {
                                amountDue = 0;
                              } else if (currentPercentage <= 40) {
                                // Level 1: 40% completion
                                amountDue = Math.round(acceptedBidAmount * 0.40);
                              } else if (currentPercentage <= 60) {
                                // Level 2: 60% completion
                                amountDue = Math.round(acceptedBidAmount * 0.20);
                              } else if (currentPercentage <= 80) {
                                // Level 3: 80% completion
                                amountDue = Math.round(acceptedBidAmount * 0.20);
                              } else if (currentPercentage <= 100) {
                                // Level 4: 100% completion
                                amountDue = Math.round(acceptedBidAmount * 0.20);
                              }
                              
                              return amountDue;
                            })()}
                            projectName={project.title}
                          />
                          
                          <div className="text-center">
                            <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                              💡 Scan QR code above with any UPI app to pay directly
                            </p>
                          </div>
                          
                          {/* Transaction ID Input for Recruiter */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-blue-900">Transaction ID (Required)</h4>
                              <button
                                type="button"
                                onClick={() => setShowTransactionInput(!showTransactionInput)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {showTransactionInput ? 'Hide' : 'Show'} Transaction ID
                              </button>
                            </div>
                            
                            {showTransactionInput && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={transactionId}
                                  onChange={(e) => setTransactionId(e.target.value)}
                                  placeholder="Enter UPI transaction ID (e.g., UPI123456789) *Required"
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                                <p className="text-xs text-blue-700">
                                  ⚠️ Transaction ID is mandatory for payment verification
                                </p>
                                {transactionId.trim() && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`Payment Details:\nTransaction ID: ${transactionId}\nAmount: ₹${payableInfo?.payableAmount}\nUPI ID: ${getFreelancerUpiId()}\nProject: ${project.title}`);
                                      toast.success('Payment details copied to clipboard!');
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    📋 Copy Payment Details
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {/* Submit Transaction Button */}
                            <div className="text-center">
                              <button
                                onClick={handleRecordUPIPayment}
                                disabled={!transactionId.trim() || transactionSubmitted}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                  transactionSubmitted
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                    : !transactionId.trim()
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {transactionSubmitted ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    Transaction Submitted
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 inline mr-1" />
                                    Submit Transaction Details
                                  </>
                                )}
                              </button>
                              <p className="text-xs text-gray-600 mt-1">
                                Submit to send details to freelancer for verification
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">Freelancer UPI ID Not Available</p>
                      <p className="text-xs text-gray-600 mb-4">
                        The freelancer hasn't added their UPI ID yet. Please ask the freelancer to add their UPI ID in their profile.
                      </p>
                      
                      {/* Manual UPI ID Input for Testing */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-blue-900 mb-2">For Testing - Add UPI ID:</p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={manualUpiId}
                            onChange={(e) => setManualUpiId(e.target.value)}
                            placeholder="Enter UPI ID (e.g., user@paytm)"
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => {
                              if (manualUpiId.trim()) {
                                toast.success(`Test UPI ID "${manualUpiId}" added for demonstration!`);
                                console.log('🔧 Added manual UPI ID:', manualUpiId);
                              } else {
                                toast.error('Please enter a valid UPI ID');
                              }
                            }}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs font-medium"
                          >
                            🔧 Use This UPI ID for Testing
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-blue-900 mb-2">How to Add UPI ID:</p>
                        <ol className="text-xs text-blue-700 text-left space-y-1">
                          <li>1. Go to Freelancer Dashboard</li>
                          <li>2. Click on Profile Settings</li>
                          <li>3. Add UPI ID in Personal Information</li>
                          <li>4. Save the profile</li>
                        </ol>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          onClick={() => setShowUPIPayment(false)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          💳 Pay with Razorpay
                        </button>
                      </div>
                      {showUPIPayment && (
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500">
                            Direct UPI payment requires freelancer UPI ID
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Status and Confirmation */}
              {paymentCompleted && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-800 mb-1">Payment Completed</h3>
                    <p className="text-sm text-green-600 mb-4">
                      This milestone payment has been successfully completed
                    </p>
                  </div>
                  
                  {/* Payment History Section inside Payment Completed */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Payment History</h4>
                    
                    {/* Get payment details for this project */}
                    {(() => {
                      // Fix payment amounts first
                      const fixedVerifications = fixPaymentAmounts();
                      const projectPayments = fixedVerifications.filter(v => 
                        v.projectId === id && 
                        v.recruiterId === user?.id && 
                        (v.status === 'ACCEPTED' || v.status === 'REJECTED')
                      );
                      
                      console.log('🔍 Payment History Debug:', {
                        projectId: id,
                        userId: user?.id,
                        projectPayments,
                        milestoneAmounts,
                        getLevelAmount: (level) => getLevelAmount(level)
                      });
                      
                      return projectPayments.length > 0 ? (
                        <div className="space-y-2">
                          {projectPayments.map((payment, index) => {
                            // Calculate the milestone level based on payment amount or timestamp
                            const paymentLevel = (() => {
                              // Try to determine level from payment data or use sequential logic
                              const sortedPayments = [...projectPayments].sort((a, b) => 
                                new Date(a.submittedAt) - new Date(b.submittedAt)
                              );
                              const currentIndex = sortedPayments.findIndex(p => p.transactionId === payment.transactionId);
                              return currentIndex + 1; // Level 1, 2, 3, or 4
                            })();
                            
                            const actualAmount = payment.amount; // Use the fixed amount from localStorage
                            
                            return (
                              <div key={payment.transactionId} className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                      payment.status === 'REJECTED' 
                                        ? 'bg-red-100 text-red-700' 
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      📱 Level {paymentLevel}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {payment.projectName}
                                    </span>
                                    {payment.status === 'REJECTED' && (
                                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                        Rejected
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${
                                      payment.status === 'REJECTED' ? 'text-red-500 line-through' : 'text-green-600'
                                    }`}>
                                      ₹{actualAmount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {(() => {
                                        // Use correct level percentages
                                        if (paymentLevel === 1) return '40% of total';
                                        if (paymentLevel === 2) return '60% of total';
                                        if (paymentLevel === 3) return '80% of total';
                                        if (paymentLevel === 4) return '100% of total';
                                        return `${Math.round((paymentLevel * 25))}% of total`;
                                      })()}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                  <div>
                                    <span className="font-medium">Transaction ID:</span>
                                    <div className="text-gray-900">{payment.transactionId}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Paid To:</span>
                                    <div className="text-gray-900">{payment.upiId}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Date:</span>
                                    <div className="text-gray-900">
                                      {new Date(payment.submittedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Time:</span>
                                    <div className="text-gray-900">
                                      {new Date(payment.submittedAt).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="flex items-center gap-2 text-xs text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Accepted by freelancer</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Total Summary */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Total Paid:</span>
                              <span className="text-lg font-bold text-green-600">
                                ₹{projectPayments
                                  .filter(payment => payment.status === 'ACCEPTED')
                                  .reduce((sum, payment) => sum + (payment.amount || 0), 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">Accepted Bid Amount:</span>
                              <span className="text-xs font-medium text-gray-700">
                                ₹{project.acceptedBid?.bidAmount?.toLocaleString() || project.budget?.toLocaleString() || '0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No payment records found</p>
                        </div>
                      );
                    })()}
                  </div>
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
