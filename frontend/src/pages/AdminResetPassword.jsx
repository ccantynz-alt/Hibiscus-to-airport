import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { Loader2, Lock, CheckCircle, XCircle } from 'lucide-react';

import { BACKEND_URL } from '../config';


const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ 
        title: 'Passwords do not match', 
        description: 'Please make sure both passwords are the same',
        variant: 'destructive' 
      });
      return;
    }

    if (password.length < 8) {
      toast({ 
        title: 'Password too short', 
        description: 'Password must be at least 8 characters',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${BACKEND_URL}/api/admin/reset-password`, {
        token: token,
        new_password: password
      });
      
      setSuccess(true);
      toast({ 
        title: 'Password Reset!', 
        description: 'You can now login with your new password' 
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to reset password. The link may have expired.';
      setError(message);
      toast({ 
        title: 'Reset Failed', 
        description: message,
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-md border-2 border-green-500/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Password Reset!</h1>
            <p className="text-gray-400 mb-6">
              Your password has been successfully reset. Redirecting to login...
            </p>
            <Button
              onClick={() => navigate('/admin/login')}
              className="bg-gold hover:bg-amber-500 text-black font-bold"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state (no token)
  if (!token || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-md border-2 border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
            <p className="text-gray-400 mb-6">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <Button
              onClick={() => navigate('/admin/login')}
              className="bg-gold hover:bg-amber-500 text-black font-bold"
            >
              Back to Login
            </Button>
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
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
            <p className="text-gray-400 text-sm">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="bg-black/50 border-gold/30 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-black/50 border-gold/30 text-white"
              />
            </div>

            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-sm">Passwords do not match</p>
            )}

            <Button 
              type="submit" 
              disabled={loading || password !== confirmPassword}
              className="w-full bg-gold hover:bg-amber-500 text-black font-bold py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;
