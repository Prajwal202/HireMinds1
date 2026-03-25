import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Send, X } from 'lucide-react';
import { paymentAPI } from '../api';
import toast from 'react-hot-toast';

const PaymentVerification = ({ user }) => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load transactions from backend API
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        
        // Get freelancer payments from backend API
        const response = await paymentAPI.getFreelancerPayments();
        
        console.log('🔍 PaymentVerification - API Response:', response);
        
        if (response.success && response.data.payments) {
          console.log('🔍 PaymentVerification - All payments:', response.data.payments);
          
          // Filter for pending transactions (where freelancer needs to verify)
          const pendingPayments = response.data.payments.filter(payment => {
            const isForThisFreelancer = (
              payment.freelancer?._id === user?.id || 
              payment.freelancer === user?.id ||
              payment.freelancer === user?._id
            );
            
            const isPending = (
              payment.transactionStatus === 'CREATED' && 
              !payment.verified
            );
            
            console.log('🔍 Payment check:', {
              paymentId: payment._id,
              freelancerId: payment.freelancer,
              currentUserId: user?.id,
              currentUserId_alt: user?._id,
              isForThisFreelancer,
              transactionStatus: payment.transactionStatus,
              verified: payment.verified,
              isPending
            });
            
            return isForThisFreelancer && isPending;
          });
          
          console.log('🔍 PaymentVerification - Pending payments:', pendingPayments);
          
          // Add unique IDs if not present
          const transactionsWithIds = pendingPayments.map((payment, index) => {
            const status = (
              payment.transactionStatus === 'CREATED' && 
              !payment.verified
            ) ? 'PENDING' : 
            (payment.verified ? 'ACCEPTED' : 
            (payment.transactionStatus === 'REJECTED' ? 'REJECTED' : 'PENDING'));
            
            console.log('🔍 Setting transaction status:', {
              paymentId: payment._id,
              transactionStatus: payment.transactionStatus,
              verified: payment.verified,
              calculatedStatus: status
            });
            
            return {
              ...payment,
              id: payment._id || `txn_${Date.now()}_${index}`,
              recruiterName: payment.recruiter?.name || 'Recruiter',
              projectName: payment.project?.title || 'Project',
              submittedAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
              status
            };
          });
          
          setPendingTransactions(transactionsWithIds);
          
          if (pendingPayments.length === 0) {
            console.log('🔍 PaymentVerification - No pending transactions found');
          } else {
            console.log(`🔍 PaymentVerification - Found ${pendingPayments.length} pending transactions`);
          }
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        toast.error('Failed to load payment verifications');
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadTransactions();

    // Listen for new transaction submissions
    const handleNewTransaction = (event) => {
      console.log('New transaction verification received:', event.detail);
      loadTransactions(); // Reload transactions
    };

    window.addEventListener('newTransactionVerification', handleNewTransaction);

    // Cleanup
    return () => {
      window.removeEventListener('newTransactionVerification', handleNewTransaction);
    };
  }, [user?.id, user?._id]);

  const handleAcceptPayment = async (transaction) => {
    try {
      // Update local state immediately for better UX
      setPendingTransactions(prev => 
        prev.map(t => t.id === transaction.id 
          ? { ...t, status: 'ACCEPTED' }
          : t
        )
      );
      
      toast.success('✅ Accepting payment...');
      
      // Call the correct backend API for freelancer to verify transaction
      const response = await paymentAPI.verifyTransaction(transaction._id || transaction.id);
      
      if (response.success) {
        toast.success('✅ Payment accepted and recorded!');
        
        console.log('Payment accepted:', transaction);
        
        // Remove from pending after successful recording
        setTimeout(() => {
          setPendingTransactions(prev => prev.filter(t => t.id !== transaction.id));
          
          // Notify recruiter dashboard to refresh payments
          console.log('📡 Dispatching paymentAccepted event:', {
            transactionId: transaction.transactionId,
            amount: transaction.amount,
            recruiterId: transaction.recruiterId
          });
          
          window.dispatchEvent(new CustomEvent('paymentAccepted', { 
            detail: {
              transactionId: transaction.transactionId,
              amount: transaction.amount,
              recruiterId: transaction.recruiterId
            }
          }));
          
          // Notify freelancer payments page to refresh
          window.dispatchEvent(new CustomEvent('freelancerPaymentAccepted', { 
            detail: {
              transactionId: transaction.transactionId,
              amount: transaction.amount,
              freelancerId: transaction.freelancerId
            }
          }));
        }, 2000);
      } else {
        // Revert state on error
        setPendingTransactions(prev => 
          prev.map(t => t.id === transaction.id 
            ? { ...t, status: 'PENDING' }
            : t
          )
        );
        toast.error(response.message || 'Failed to accept payment');
      }
    } catch (error) {
      // Revert state on error
      setPendingTransactions(prev => 
        prev.map(t => t.id === transaction.id 
          ? { ...t, status: 'PENDING' }
          : t
        )
      );
      
      console.error('Error accepting payment:', error);
      toast.error(error.response?.data?.error || 'Failed to accept payment');
    }
  };

  const handleRejectPayment = async (transaction) => {
    try {
      // Update local state immediately
      setPendingTransactions(prev => 
        prev.map(t => t.id === transaction.id 
          ? { ...t, status: 'REJECTED' }
          : t
        )
      );
      
      toast.error('❌ Rejecting payment...');
      
      // Call the correct backend API for freelancer to reject transaction
      const response = await paymentAPI.rejectTransactionAsFreelancer(
        transaction._id || transaction.id, 
        'Payment verification failed - transaction details do not match'
      );
      
      if (response.success) {
        toast.error('❌ Payment rejected. Please contact recruiter.');
        
        console.log('Payment rejected:', transaction);
        
        // Remove from pending after rejection
        setTimeout(() => {
          setPendingTransactions(prev => prev.filter(t => t.id !== transaction.id));
        }, 2000);
      } else {
        // Revert state on error
        setPendingTransactions(prev => 
          prev.map(t => t.id === transaction.id 
            ? { ...t, status: 'PENDING' }
            : t
          )
        );
        toast.error(response.message || 'Failed to reject payment');
      }
    } catch (error) {
      // Revert state on error
      setPendingTransactions(prev => 
        prev.map(t => t.id === transaction.id 
          ? { ...t, status: 'PENDING' }
          : t
        )
      );
      
      console.error('Error rejecting payment:', error);
      toast.error(error.response?.data?.error || 'Failed to reject payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'ACCEPTED':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'REJECTED':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Verifications</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading payment verifications...</span>
        </div>
      </div>
    );
  }

  if (pendingTransactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Verifications</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600">No pending payment verifications</p>
          <p className="text-sm text-gray-500 mt-1">You'll see payment requests here when recruiters submit transaction details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment Verifications 
        {pendingTransactions.filter(t => t.status === 'PENDING').length > 0 && (
          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            {pendingTransactions.filter(t => t.status === 'PENDING').length} pending
          </span>
        )}
      </h3>

      <div className="space-y-4">
        {pendingTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className={`border rounded-lg p-4 ${getStatusColor(transaction.status)}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getStatusIcon(transaction.status)}
                <span className="ml-2 font-medium text-sm">
                  {transaction.status === 'PENDING' && 'Pending Verification'}
                  {transaction.status === 'ACCEPTED' && 'Payment Accepted'}
                  {transaction.status === 'REJECTED' && 'Payment Rejected'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {transaction.submittedAt.toLocaleString()}
              </span>
            </div>

            {/* Transaction Details */}
            <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Project:</span> {transaction.projectName}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ₹{transaction.amount?.toLocaleString() || '0'}
                </div>
                <div>
                  <span className="font-medium">Transaction ID:</span> {transaction.transactionId}
                </div>
                <div>
                  <span className="font-medium">UPI ID:</span> {transaction.gatewayOrderId?.includes('UPI') ? 'UPI Payment' : 'Direct Transfer'}
                </div>
                <div>
                  <span className="font-medium">Recruiter:</span> {transaction.recruiterName}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span> {transaction.submittedAt?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {transaction.status === 'PENDING' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <p className="text-sm text-gray-700 mb-2">
                  Please verify this transaction in your UPI app and respond:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptPayment(transaction)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Accept Payment
                  </button>
                  <button
                    onClick={() => handleRejectPayment(transaction)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Reject Payment
                  </button>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {transaction.status === 'ACCEPTED' && (
              <div className="text-center">
                <p className="text-sm text-green-700 font-medium">
                  ✅ Payment accepted and recorded successfully!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  The payment has been added to your payment history
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This verification will disappear in a few seconds...
                </p>
              </div>
            )}

            {transaction.status === 'REJECTED' && (
              <div className="text-center">
                <p className="text-sm text-red-700 font-medium">
                  ❌ Payment rejected
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Please contact the recruiter to resolve this payment issue
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This verification will disappear in a few seconds...
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 How it works:</h4>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Recruiter submits transaction details after making UPI payment</li>
          <li>You receive a notification to verify the transaction</li>
          <li>Check your UPI app for the transaction details</li>
          <li>Accept if the details match, or reject if they don't</li>
          <li>Accepted payments are automatically recorded in your payment history</li>
        </ol>
      </div>
    </div>
  );
};

export default PaymentVerification;
