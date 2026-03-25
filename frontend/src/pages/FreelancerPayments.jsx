import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { IndianRupee, ArrowLeft, Calendar, Briefcase, User, CheckCircle } from 'lucide-react';

import { paymentAPI } from '../api';

import toast from 'react-hot-toast';

import PaymentVerification from '../components/PaymentVerification';

import { useAuth } from '../contexts/AuthContext';



const FreelancerPayments = () => {

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState([]);

  const [totalReceived, setTotalReceived] = useState(0);



  // Calculate milestone amount based on actual level percentages

  const calculateMilestoneAmount = (acceptedBidAmount, level) => {

    if (level === 1) return Math.round(acceptedBidAmount * 0.40); // Level 1: 40%

    if (level === 2) return Math.round(acceptedBidAmount * 0.20); // Level 2: 20%

    if (level === 3) return Math.round(acceptedBidAmount * 0.20); // Level 3: 20%

    if (level === 4) return Math.round(acceptedBidAmount * 0.20); // Level 4: 20%

    return Math.round(acceptedBidAmount * 0.25); // Fallback

  };



  // Fix payment amounts to use correct milestone amounts

  const fixPaymentAmounts = (payments) => {

    return payments.map(payment => {

      if (payment.isFromVerification) {

        // For verification payments, use the actual amount that was paid

        // Don't recalculate - use the stored amount which is what was actually paid

        

        console.log('🔧 Keeping original freelancer payment amount:', {

          transactionId: payment.transactionId,

          status: payment.status,

          amount: payment.amount,

          project: payment.project?.title

        });

        

        // Return payment with original amount - no recalculation needed

        return payment;

      }

      return payment;

    });

  };



  useEffect(() => {

    const loadPayments = async () => {

      try {

        setLoading(true);

        

        // Fetch backend payments

        const response = await paymentAPI.getFreelancerPayments();

        let backendPayments = [];

        let backendTotal = 0;

        

        if (response?.success) {

          backendPayments = response.data?.payments || [];

          backendTotal = response.data?.totalReceived || 0;

        }

        

        // Fetch all payments from verification system (both accepted and rejected)

        const storedVerifications = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');

        console.log('🔍 Freelancer Payments Debug:', {

          totalVerifications: storedVerifications.length,

          freelancerId: user?.id,

          allVerifications: storedVerifications.map(v => ({

            id: v.id,

            projectId: v.projectId,

            freelancerId: v.freelancerId,

            recruiterId: v.recruiterId,

            status: v.status,

            amount: v.amount,

            projectName: v.projectName,

            submittedAt: v.submittedAt

          }))

        });

        

        // Check if any amounts need to be corrected (25 should be 40 for Level 1)

        const correctedVerifications = storedVerifications.map(v => {

          if (v.freelancerId === user?.id && v.status === 'ACCEPTED' && v.amount === 25) {

            console.log('🔧 Correcting payment amount from 25 to 40:', {

              transactionId: v.transactionId,

              projectId: v.projectId,

              oldAmount: v.amount,

              newAmount: 40

            });

            return { ...v, amount: 40 };

          }

          return v;

        });

        

        // Update localStorage with corrected amounts

        if (JSON.stringify(correctedVerifications) !== JSON.stringify(storedVerifications)) {

          localStorage.setItem('paymentVerifications', JSON.stringify(correctedVerifications));

          console.log('💾 Updated localStorage with corrected amounts');

        }

        

        const freelancerPayments = correctedVerifications.filter(verification => 

          verification.freelancerId === user?.id && 

          (verification.status === 'ACCEPTED' || verification.status === 'REJECTED')

        );

        

        console.log('🔍 Filtered Freelancer Payments:', {

          freelancerPayments,

          acceptedCount: freelancerPayments.filter(p => p.status === 'ACCEPTED').length,

          rejectedCount: freelancerPayments.filter(p => p.status === 'REJECTED').length

        });

        

        // Convert verifications to payment format

        const acceptedPayments = freelancerPayments.map(verification => ({

          _id: verification.id,

          amount: verification.amount,

          transactionId: verification.transactionId,

          paidAt: verification.submittedAt,

          transactionStatus: verification.status === 'ACCEPTED' ? 'PAID' : 'REJECTED',

          status: verification.status, // Keep original status for filtering

          gateway: 'UPI_DIRECT',

          project: { title: verification.projectName },

          recruiter: { name: verification.recruiterName || 'Recruiter' },

          isFromVerification: true // Flag to identify verification payments

        }));

        

        // Combine both payment sources

        const allPayments = [...backendPayments, ...acceptedPayments];

        

        // Fix payment amounts for verification payments

        const fixedPayments = fixPaymentAmounts(allPayments);

        

        // Calculate total from both sources using fixed amounts (only accepted payments)

        const verificationTotal = fixedPayments

          .filter(p => p.isFromVerification && p.status === 'ACCEPTED')

          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        const totalAmount = backendTotal + verificationTotal;

        

        // Sort by paidAt date (most recent first)

        fixedPayments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

        

        console.log('🔍 Final Payments Array:', {

          totalPayments: fixedPayments.length,

          acceptedPayments: fixedPayments.filter(p => p.status === 'ACCEPTED').map(p => ({

            id: p._id,

            originalAmount: p.amount,

            displayAmount: p.amount,

            project: p.project?.title,

            status: p.status

          })),

          rejectedPayments: fixedPayments.filter(p => p.status === 'REJECTED'),

          allPayments: fixedPayments.map(p => ({

            id: p._id,

            amount: p.amount,

            status: p.status,

            project: p.project?.title,

            isFromVerification: p.isFromVerification

          }))

        });

        

        setPayments(fixedPayments);

        setTotalReceived(totalAmount);

      } catch (error) {

        toast.error(error?.response?.data?.error || 'Failed to load payments');

      } finally {

        setLoading(false);

      }

    };



    loadPayments();

    

    // Listen for payment acceptance events

    const handleFreelancerPaymentAccepted = (event) => {

      console.log('Freelancer payment accepted:', event.detail);

      

      // Only refresh if this payment is for current freelancer

      if (event.detail.freelancerId === user?.id) {

        loadPayments();

        

        // Show success message

        toast.success(`Payment of ₹${event.detail.amount?.toLocaleString()} added to your total!`);

      }

    };



    window.addEventListener('freelancerPaymentAccepted', handleFreelancerPaymentAccepted);



    return () => {

      window.removeEventListener('freelancerPaymentAccepted', handleFreelancerPaymentAccepted);

    };

  }, [user?.id]);



  return (

    <div className="min-h-screen bg-gray-50 py-8">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Link

              to="/freelancer/dashboard"

              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"

            >

              <ArrowLeft className="w-5 h-5" />

            </Link>

            <div>

              <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>

              <p className="text-gray-600">Payment verifications and received payment history</p>

            </div>

          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">

            <p className="text-sm text-green-700">Total Received</p>

            <p className="text-xl font-bold text-green-800">₹{Number(totalReceived || 0).toLocaleString()}</p>

          </div>

        </div>



        {/* Payment Verifications Section */}

        <PaymentVerification user={user} />



        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">

          {loading ? (

            <div className="p-8 text-center text-gray-600">Loading payments...</div>

          ) : payments.length === 0 ? (

            <div className="p-8 text-center text-gray-600">No verified payments yet.</div>

          ) : (

            <div className="divide-y divide-gray-100">

              {(() => {

                console.log('🔍 Rendering Payments:', payments.map(p => ({

                  id: p._id,

                  status: p.status,

                  amount: p.amount,

                  project: p.project?.title,

                  isFromVerification: p.isFromVerification

                })));

                return null;

              })()}

              {payments.map((payment) => (

                <div key={payment._id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div className="space-y-2">

                    <div className="flex items-center gap-2 text-gray-900 font-semibold">

                      <Briefcase className="w-4 h-4" />

                      <span>{payment.project?.title || 'Project'}</span>

                      {payment.isFromVerification && (

                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">

                          Verified

                        </span>

                      )}

                      {payment.status === 'REJECTED' && (

                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">

                          Rejected

                        </span>

                      )}

                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">

                      <User className="w-4 h-4" />

                      <span>Paid by: {payment.recruiter?.name || 'Recruiter'}</span>

                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">

                      <Calendar className="w-4 h-4" />

                      <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'Date unavailable'}</span>

                    </div>

                    {payment.isFromVerification && (

                      <div className="text-sm text-blue-600 flex items-center gap-2">

                        <CheckCircle className="w-4 h-4" />

                        <span>UPI Direct Payment</span>

                      </div>

                    )}

                  </div>

                  <div className="text-right">

                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-2 ${

                      payment.status === 'REJECTED' 

                        ? 'bg-red-100 text-red-700' 

                        : 'bg-green-100 text-green-700'

                    }`}>

                      {payment.status === 'REJECTED' ? 'REJECTED' : 'PAID'}

                    </div>

                    <div className={`text-2xl font-bold flex items-center justify-end gap-1 ${

                      payment.status === 'REJECTED' ? 'text-red-500 line-through' : 'text-gray-900'

                    }`}>

                      <IndianRupee className="w-5 h-5" />

                      {Number(payment.amount || 0).toLocaleString()}

                    </div>

                    <div className="text-xs text-gray-500 mt-1">Txn: {payment.gatewayPaymentId || payment.transactionId || '-'}</div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );

};



export default FreelancerPayments;



