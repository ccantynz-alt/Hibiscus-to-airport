import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

import { BACKEND_URL } from '../config';


const ChangePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate new password
    if (formData.new_password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive'
      });
      return;
    }

    // Confirm passwords match
    if (formData.new_password !== formData.confirm_password) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      await axios.post(
        `${BACKEND_URL}/api/admin/change-password`,
        {
          current_password: formData.current_password,
          new_password: formData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: 'Success!',
        description: 'Your password has been changed successfully'
      });

      // Clear form
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to change password';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gold/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="border-gold/30 text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Change Password
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-6 mt-12">
        <div className="bg-gray-900/80 backdrop-blur-md border-2 border-gold/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-gold" />
            <div>
              <h2 className="text-2xl font-bold text-white">Update Your Password</h2>
              <p className="text-gray-400 text-sm">Enter your current password and choose a new one</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  placeholder="Enter your current password"
                  required
                  className="bg-black/50 border-gold/30 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password *
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="Enter new password (min. 8 characters)"
                  required
                  minLength={8}
                  className="bg-black/50 border-gold/30 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Re-enter your new password"
                  required
                  minLength={8}
                  className="bg-black/50 border-gold/30 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-black/50 border border-gold/20 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gold mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className={formData.new_password.length >= 8 ? 'text-green-400' : ''}>
                  ✓ At least 8 characters long
                </li>
                <li className={formData.new_password === formData.confirm_password && formData.new_password ? 'text-green-400' : ''}>
                  ✓ Passwords match
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-amber-500 text-black font-bold py-6 text-lg"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
