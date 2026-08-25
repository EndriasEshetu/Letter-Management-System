import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import PasswordInput from '@/components/common/PasswordInput';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export const Profile: React.FC = () => {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'New password and confirmation do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccess('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFieldErrors({});
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#292A27]">User Profile & Security</h1>
          <p className="text-sm text-[#6B6A64]">Manage your account details and update your password.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Account Info */}
          <div className="md:col-span-1">
            <Card className="space-y-4">
              <div className="w-16 h-16 bg-[#526A55] text-[#F5F3ED] rounded-2xl flex items-center justify-center text-xl font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#292A27]">{user?.full_name || 'Officer'}</h2>
                <p className="text-xs text-[#6B6A64]">{user?.email}</p>
              </div>

              <div className="pt-3 border-t border-[#D8D7D1]/60 space-y-2 text-xs">
                <div>
                  <span className="text-[#8A8983] block">Role:</span>
                  <span className="font-semibold text-[#526A55]">{user?.role}</span>
                </div>
                <div>
                  <span className="text-[#8A8983] block">Department:</span>
                  <span className="font-medium text-[#292A27]">
                    {user?.department_name || `Dept ID: ${user?.department_id ?? 'N/A'}`}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A8983] block">Account Status:</span>
                  <span className="inline-flex items-center text-[#4A6B4E] font-medium">
                    <span className="w-1.5 h-1.5 bg-[#4A6B4E] rounded-full mr-1.5" />
                    Active
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" fullWidth onClick={handleLogout}>
                  Sign Out of Account
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Password Change Form */}
          <div className="md:col-span-2">
            <Card className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#292A27]">Change Password</h3>
                <p className="text-xs text-[#6B6A64]">
                  Update your password regularly to protect system data and official records.
                </p>
              </div>

              {error && (
                <Alert type="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert type="success" onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4" noValidate>
                <PasswordInput
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (fieldErrors.currentPassword)
                      setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }));
                  }}
                  error={fieldErrors.currentPassword}
                  disabled={isSubmitting}
                />

                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword)
                      setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  error={fieldErrors.newPassword}
                  disabled={isSubmitting}
                />

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  error={fieldErrors.confirmPassword}
                  disabled={isSubmitting}
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" isLoading={isSubmitting}>
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
    </div>
  );
};

export default Profile;
