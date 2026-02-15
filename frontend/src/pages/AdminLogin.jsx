import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';

import { BACKEND_URL } from '../config';


// Separate component to handle OAuth callback
const GoogleAuthCallback = ({ onSuccess, onError }) => {
  const hasProcessed = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        const hash = window.location.hash;
        const sessionId = hash.split('session_id=')[1]?.split('&')[0];
        
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        console.log('Processing Google OAuth with session_id:', sessionId.substring(0, 20) + '...');

        const response = await axios.post(`${BACKEND_URL}/api/admin/google-auth`, {
          session_id: sessionId
        });

        // Clear the hash immediately
        window.history.replaceState(null, '', window.location.pathname);

        localStorage.setItem('admin_token', response.data.access_token);
        
        toast({ 
          title: 'Welcome!', 
          description: `Signed in as ${response.data.user.email}` 
        });

        onSuccess(response.data);
      } catch (error) {
        console.error('Google auth error:', error);
        
        // Clear the hash
        window.history.replaceState(null, '', window.location.pathname);
        
        const message = error.response?.data?.detail || 'Google authentication failed';
        toast({ 
          title: 'Access Denied', 
          description: message,
          variant: 'destructive' 
        });
        
        onError(message);
      }
    };

    processAuth();
  }, [onSuccess, onError, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto mb-4" />
        <p className="text-white text-lg">Signing you in with Google...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [authError, setAuthError] = useState('');

  // CRITICAL: Check for session_id synchronously during render
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const hasSessionId = hash && hash.includes('session_id=');

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token && !hasSessionId) {
      navigate('/admin/dashboard');
    }
  }, [navigate, hasSessionId]);

  const handleAuthSuccess = (data) => {
    navigate('/admin/dashboard');
  };

  const handleAuthError = (message) => {
    setAuthError(message);
  };

  // If we have a session_id, show the callback handler
  if (hasSessionId) {
    return <GoogleAuthCallback onSuccess={handleAuthSuccess} onError={handleAuthError} />;
  }

  const handleGoogleLogin = () => {
    // Use window.location.origin to get the current domain dynamically
    const redirectUrl = window.location.origin + '/admin/login';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/login`, credentials);
      localStorage.setItem('admin_token', response.data.access_token);
      toast({ title: 'Login Successful!', description: 'Welcome back' });
      navigate('/admin/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid credentials';
      setAuthError(message);
      toast({ 
        title: 'Login Failed', 
        description: message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/api/admin/forgot-password`, {
        email: resetEmail
      });
      setResetSent(true);
      toast({ 
        title: 'Email Sent', 
        description: 'Check your inbox for the reset link' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to send reset email', 
        variant: 'destructive' 
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-md border-2 border-gold/20 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetSent(false);
                setResetEmail('');
              }}
              className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400 text-sm">
                {resetSent 
                  ? 'Check your email for the reset link' 
                  : 'Enter your email to receive a reset link'}
              </p>
            </div>

            {resetSent ? (
              <div className="text-center">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-green-400 text-sm">
                    ✅ Reset link sent! Check your inbox at <strong>{resetEmail}</strong>
                  </p>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  onClick={() => {
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold/10"
                >
                  Try Another Email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="info@bookaride.co.nz"
                      required
                      className="bg-black/50 border-gold/30 text-white pl-10"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={resetLoading}
                  className="w-full bg-gold hover:bg-amber-500 text-black font-bold py-6"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-md border-2 border-gold/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Admin Login
            </h1>
            <p className="text-gray-400">Hibiscus to Airport</p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm text-center">{authError}</p>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-4 px-6 rounded-xl transition-all mb-6 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">or sign in with password</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <Input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="admin"
                required
                className="bg-black/50 border-gold/30 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="••••••••"
                required
                className="bg-black/50 border-gold/30 text-white"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold hover:bg-amber-500 text-black font-bold py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-gold hover:text-amber-400 text-sm transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
