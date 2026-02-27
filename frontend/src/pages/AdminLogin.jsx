import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';

import { BACKEND_URL } from '../config';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [authError, setAuthError] = useState('');

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

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
                    Reset link sent! Check your inbox at <strong>{resetEmail}</strong>
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
