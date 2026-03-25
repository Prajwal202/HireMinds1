import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentVerification = ({ user }) => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from backend API
  useEffect(() => {
    const loadTransactions = () => {
      // Get transactions from localStorage (simulating backend)
      const storedTransactions = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
      
      // Filter for current user's transactions (where they are the freelancer) and only PENDING ones
      const userTransactions = storedTransactions.filter(transaction => 
        (transaction.freelancerId === user?.id || 
        transaction.freelancerId === user?._id) &&
        transaction.status === 'PENDING'
      );
      
      // Add unique IDs if not present
      const transactionsWithIds = userTransactions.map((transaction, index) => ({
        ...transaction,
        id: transaction.id || `txn_${Date.now()}_${index}`,
        recruiterName: transaction.recruiterName || 'Recruiter'
      }));
      
      setPendingTransactions(transactionsWithIds);
      setLoading(false);
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
      
      // Update localStorage
      const storedTransactions = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
      const updatedTransactions = storedTransactions.map(t => 
        (t.transactionId === transaction.transactionId && t.freelancerId === user?.id) 
          ? { ...t, status: 'ACCEPTED' }
          : t
      );
      localStorage.setItem('paymentVerifications', JSON.stringify(updatedTransactions));
      
      toast.success('✅ Payment accepted and recorded!');
      
      // In real app, this would call backend API to:
      // 1. Record the payment in the database
      // 2. Update transaction status
      // 3. Notify the recruiter
      // 4. Add to payment history
      
      console.log('Payment accepted:', transaction);
      
      // Simulate backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from pending after successful recording
      setTimeout(() => {
        setPendingTransactions(prev => prev.filter(t => t.id !== transaction.id));
        
        // Update status in localStorage to ACCEPTED (keep for payment history)
        const storedTransactions = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
        const updatedTransactions = storedTransactions.map(t => 
          (t.transactionId === transaction.transactionId && t.freelancerId === user?.id) 
            ? { ...t, status: 'ACCEPTED' }
            : t
        );
        localStorage.setItem('paymentVerifications', JSON.stringify(updatedTransactions));
        
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
      
    } catch (error) {
      // Revert state on error
      setPendingTransactions(prev => 
        prev.map(t => t.id === transaction.id 
          ? { ...t, status: 'PENDING' }
          : t
        )
      );
      
      toast.error('Failed to accept payment');
      console.error('Error accepting payment:', error);
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
      
      // Update localStorage
      const storedTransactions = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
      const updatedTransactions = storedTransactions.map(t => 
        (t.transactionId === transaction.transactionId && t.freelancerId === user?.id) 
          ? { ...t, status: 'REJECTED' }
          : t
      );
      localStorage.setItem('paymentVerifications', JSON.stringify(updatedTransactions));
      
      toast.error('❌ Payment rejected. Please contact recruiter.');
      
      // In real app, this would call backend API to:
      // 1. Mark transaction as rejected
      // 2. Notify the recruiter
      // 3. Create dispute record if needed
      
      console.log('Payment rejected:', transaction);
      
      // Simulate backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Keep rejected transaction visible for a while, then remove
      setTimeout(() => {
        setPendingTransactions(prev => prev.filter(t => t.id !== transaction.id));
        
        // Also remove from localStorage
        const finalTransactions = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
        const filteredTransactions = finalTransactions.filter(t => 
          !(t.transactionId === transaction.transactionId && t.freelancerId === user?.id)
        );
        localStorage.setItem('paymentVerifications', JSON.stringify(filteredTransactions));
      }, 5000);
      
    } catch (error) {
      // Revert state on error
      setPendingTransactions(prev => 
        prev.map(t => t.id === transaction.id 
          ? { ...t, status: 'PENDING' }
          : t
        )
      );
      
      toast.error('Failed to reject payment');
      console.error('Error rejecting payment:', error);
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
                  <span className="font-medium">Amount:</span> ₹{transaction.amount.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Transaction ID:</span> {transaction.transactionId}
                </div>
                <div>
                  <span className="font-medium">UPI ID:</span> {transaction.upiId}
                </div>
                <div>
                  <span className="font-medium">Recruiter:</span> {transaction.recruiterName}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span> {transaction.submittedAt.toLocaleString()}
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
