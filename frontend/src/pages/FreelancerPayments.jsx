import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ArrowLeft, Calendar, Briefcase, User } from 'lucide-react';
import { paymentAPI } from '../api';
import toast from 'react-hot-toast';

const FreelancerPayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [totalReceived, setTotalReceived] = useState(0);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const response = await paymentAPI.getFreelancerPayments();
        if (response?.success) {
          setPayments(response.data?.payments || []);
          setTotalReceived(response.data?.totalReceived || 0);
        }
      } catch (error) {
        toast.error(error?.response?.data?.error || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

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
              <p className="text-gray-600">All verified payments received for your projects</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-sm text-green-700">Total Received</p>
            <p className="text-xl font-bold text-green-800">₹{Number(totalReceived || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No verified payments yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <div key={payment._id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Briefcase className="w-4 h-4" />
                      <span>{payment.project?.title || 'Project'}</span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Paid by: {payment.recruiter?.name || 'Recruiter'}</span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'Date unavailable'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mb-2">
                      PAID
                    </div>
                    <div className="text-2xl font-bold text-gray-900 flex items-center justify-end gap-1">
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

