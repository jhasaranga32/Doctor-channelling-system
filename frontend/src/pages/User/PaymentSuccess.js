import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        toast.error('Invalid session.');
        navigate('/appointments');
        return;
      }

      try {
        await paymentAPI.verifySession({ session_id: sessionId });
        toast.success('Payment successful! Your appointment has been booked.');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Payment verification failed.');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center">
        {verifying ? (
          <>
            <div className="animate-spin h-12 w-12 border-4 border-slate-900 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment...</h2>
            <p className="text-slate-500">Please wait while we confirm your booking.</p>
          </>
        ) : (
          <>
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-8">Your appointment has been confirmed and booked.</p>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to My Appointments
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
