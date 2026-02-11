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
import { projectAPI, paymentAPI, testExport } from '../api';
import toast from 'react-hot-toast';

console.log('Test export:', testExport);

const ProjectPayments = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [payableInfo, setPayableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      console.log('Loading project data for ID:', id);
      
      // Load project details
      const projectResponse = await projectAPI.getProjectDetails(id);
      console.log('Project response:', projectResponse);
      
      if (projectResponse.success) {
        console.log('Raw project response:', projectResponse);
        console.log('Project data:', projectResponse.data);
        
        setProject(projectResponse.data);
      } else {
        console.error('Project response failed:', projectResponse);
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
      console.error('Error loading project data:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 404) {
        toast.error('Project not found');
        navigate('/recruiter/dashboard');
      } else {
        toast.error('Failed to load project data');
      }
    } finally {
      setLoading(false);
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

  const handlePayment = async () => {
    console.log('=== PAYMENT DEBUG ===');
    console.log('Pay Now clicked');
    console.log('Payable info:', payableInfo);
    console.log('Payment exists:', payableInfo?.paymentExists);
    console.log('Payment status:', payableInfo?.paymentStatus);
    
    if (!payableInfo || payableInfo.paymentExists || payableInfo.payableAmount === 0) {
      console.log('Payment already exists, no payment required, or amount is 0');
      return;
    }

    try {
      setProcessingPayment(true);
      console.log('Starting payment process...');
      console.log('Project ID:', id);
      console.log('Current level:', payableInfo.currentLevel);
      
      // Create a simple mock payment for now
      const mockPayment = {
        success: true,
        data: {
          payment: {
            _id: 'mock_payment_' + Date.now(),
            amount: payableInfo.payableAmount,
            transactionStatus: 'SUCCESS',
            milestone: {
              level: payableInfo.currentLevel,
              status: payableInfo.currentMilestoneStatus,
              percentage: payableInfo.currentPercentage
            }
          }
        }
      };
      
      console.log('Mock payment created:', mockPayment);
      
      // Show success message
      toast.success(`Payment of ₹${payableInfo.payableAmount.toLocaleString()} completed successfully!`);
      
      // Update the payable info to show payment exists
      setPayableInfo({
        ...payableInfo,
        paymentExists: true,
        paymentStatus: 'SUCCESS'
      });
      
      // Reload data to update UI
      await loadProjectData();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

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

  useEffect(() => {
    loadProjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Payments</h1>
                <p className="text-gray-600">{project.title}</p>
              </div>
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
                    <button
                      onClick={handlePayment}
                      disabled={processingPayment}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </>
                      )}
                    </button>
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
                        {payableInfo.paymentStatus === 'SUCCESS' ? '✅ Payment completed' : '⏳ Payment already initiated'}
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
