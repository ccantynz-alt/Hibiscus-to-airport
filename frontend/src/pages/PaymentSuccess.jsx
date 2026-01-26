import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-900/80 backdrop-blur-md border-2 border-gold/30 rounded-2xl p-12">
            <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Payment Successful!
            </h1>
            
            <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
            
            <p className="text-xl text-gray-300 mb-8">
              Thank you for your booking! We've received your payment and sent confirmation details to your email and phone.
            </p>
            
            <div className="bg-black/50 border border-gold/30 rounded-xl p-6 mb-8">
              <h3 className="text-gold text-lg font-bold mb-3">What's Next?</h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li>✅ You'll receive a confirmation email shortly</li>
                <li>✅ An SMS confirmation has been sent to your phone</li>
                <li>✅ Our team will contact you 24 hours before your pickup</li>
                <li>✅ Keep your booking reference for your records</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/')}
                className="bg-gold hover:bg-amber-500 text-black font-bold py-6 px-8"
              >
                Back to Home
              </Button>
              
              <Button 
                onClick={() => navigate('/booking')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-6 px-8 border border-gold/30"
              >
                Make Another Booking
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-gray-400">
            <p>Need help? Contact us at <a href="mailto:info@bookaride.co.nz" className="text-gold hover:underline">info@bookaride.co.nz</a></p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;