import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import PasswordInput from '@/components/common/PasswordInput';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import { formatDepartmentName, getDepartmentByCodeOrName } from '@/constants/departments';

/* ─── Role Metadata Matrix ──────────────────────────────────── */

const ROLE_DETAILS: Record<
  string,
  { label: string; badgeColor: string; description: string; permissions: string[] }
> = {
  ADMIN: {
    label: 'Main Administrator',
    badgeColor: 'bg-[#C48D3F]/15 text-[#8A5D19] border-[#C48D3F]/30',
    description: 'System-wide governance clearance. Authorized to route incoming/internal letters, verify outgoing correspondence, manage official directorates, and configure user accounts.',
    permissions: [
      'Route Incoming & Internal Letters',
      'Verify & Approve Outgoing Letters',
      'Manage System Directorates & Personnel',
      'Access Full System Audit Logs',
    ],
  },
  DEPARTMENT_MANAGER: {
    label: 'Directorate Manager',
    badgeColor: 'bg-[#526A55]/15 text-[#526A55] border-[#526A55]/30',
    description: 'Directorate-level workflow manager. Responsible for assigning received correspondence to officers, setting SLA deadlines, and approving draft response letters.',
    permissions: [
      'Assign Officers & Set Deadlines',
      'Review & Approve Officer Drafts',
      'Oversee Directorate Inbox & Queue',
      'Generate Directorate Analytics',
    ],
  },
  REGISTRY_OFFICER: {
    label: 'Central Registry Officer',
    badgeColor: 'bg-[#6B5A8E]/15 text-[#4A3A6B] border-[#6B5A8E]/30',
    description: 'Central correspondence registry controller. Responsible for scanning, registering incoming letters with IN/YYYY/NNNNN reference numbers, and recording courier/email dispatches.',
    permissions: [
      'Register Incoming Letters (IN/YYYY/NNNNN)',
      'Assign Outgoing Reference Numbers',
      'Record Dispatch Details & Courier Proof',
      'Manage Physical Letter Registry Vault',
    ],
  },
  EMPLOYEE: {
    label: 'Directorate Officer',
    badgeColor: 'bg-[#292A27]/10 text-[#292A27] border-[#292A27]/20',
    description: 'Action officer within assigned directorate. Responsible for processing assigned correspondence, drafting response letters, and submitting items for manager review.',
    permissions: [
      'Execute Assigned Letter Tasks',
      'Draft Response Letters & Internal Memos',
      'Submit Drafts for Manager Sign-off',
      'Track Assigned SLA Deadlines',
    ],
  },
};

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

  const userRole = user?.role || 'EMPLOYEE';
  const roleMeta = ROLE_DETAILS[userRole] || ROLE_DETAILS.EMPLOYEE;
  const deptInfo = getDepartmentByCodeOrName(user?.department_name);
  const deptName = formatDepartmentName(user?.department_name);

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

    if (!validateForm()) return;

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
    <div className="max-w-5xl w-full mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-md">
          SITA PERSONNEL PROFILE
        </span>
        <h1 className="text-2xl font-bold text-[#292A27] tracking-tight mt-2">
          User Profile & Role Governance
        </h1>
        <p className="text-xs md:text-sm text-[#6B6A64] mt-1">
          Review your official directorate assignment, role clearances, and update account security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left 1/3: Account Summary & Directorate ── */}
        <div className="space-y-6">
          <Card className="space-y-5">
            {/* User Avatar & Name */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#526A55] text-[#F5F3ED] rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#292A27] truncate">{user?.full_name || 'Officer'}</h2>
                <p className="text-xs text-[#6B6A64] truncate mt-0.5">{user?.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border mt-2 ${roleMeta.badgeColor}`}>
                  {roleMeta.label}
                </span>
              </div>
            </div>

            {/* Directorate & Role Info */}
            <div className="pt-4 border-t border-[#D8D7D1]/60 space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] block mb-1">
                  Official Directorate
                </span>
                <span className="font-semibold text-[#292A27] block leading-snug">
                  {deptName}
                </span>
                {deptInfo && (
                  <span className="text-[10px] font-mono font-bold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-md inline-block mt-1">
                    {deptInfo.shortCode}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] block mb-1">
                  Account Status
                </span>
                <span className="inline-flex items-center text-[#4A6B4E] font-bold text-xs bg-[#4A6B4E]/10 px-2.5 py-0.5 rounded-full border border-[#4A6B4E]/20">
                  <span className="w-1.5 h-1.5 bg-[#4A6B4E] rounded-full mr-1.5 animate-pulse" />
                  Active Clearance
                </span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="pt-3 border-t border-[#D8D7D1]/60 space-y-2">
              {userRole === 'REGISTRY_OFFICER' && (
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => navigate('/letters')}>
                  📥 Central Registry Hub
                </Button>
              )}
              {userRole === 'ADMIN' && (
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => navigate('/departments')}>
                  🏛️ Directorate Administration
                </Button>
              )}
              {userRole === 'DEPARTMENT_MANAGER' && (
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => navigate('/approvals')}>
                  ⏱️ Review Approval Queue
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full justify-center text-[#8B3232] border-[#8B3232]/30 hover:bg-[#8B3232]/10" onClick={handleLogout}>
                Sign Out of System
              </Button>
            </div>
          </Card>

          {/* Directorate Information Box */}
          {deptInfo && (
            <Card className="bg-[#ECEAE3]">
              <h3 className="text-xs font-bold text-[#292A27] uppercase tracking-wider mb-2">
                Directorate Mission & Scope
              </h3>
              <p className="text-xs text-[#6B6A64] leading-relaxed">
                {deptInfo.description}
              </p>
            </Card>
          )}
        </div>

        {/* ── Right 2/3: Role Permissions & Security Form ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role Governance & Permissions Card */}
          <Card className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#292A27]">Role Clearances & System Rights</h3>
                <span className="text-[11px] font-mono font-bold text-[#6B6A64] bg-[#ECEAE3] px-2.5 py-1 rounded-lg border border-[#D8D7D1]">
                  {userRole}
                </span>
              </div>
              <p className="text-xs text-[#6B6A64] mt-1 leading-relaxed">
                {roleMeta.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#D8D7D1]/60">
              <h4 className="text-xs font-bold text-[#292A27] uppercase tracking-wider mb-3">
                Authorized Operations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roleMeta.permissions.map((perm, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#F9F8F5] border border-[#D8D7D1] flex items-center space-x-2.5 text-xs text-[#292A27] font-medium">
                    <span className="w-4 h-4 rounded-full bg-[#526A55]/15 text-[#526A55] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      ✓
                    </span>
                    <span className="truncate">{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Password Change Security Card */}
          <Card className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#292A27]">Security & Password Settings</h3>
              <p className="text-xs text-[#6B6A64] mt-1">
                Update your account password regularly to safeguard agency correspondence.
              </p>
            </div>

            {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

            <form onSubmit={handlePasswordChange} className="space-y-4" noValidate>
              <PasswordInput
                label="Current Password"
                placeholder="Enter your current password"
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
