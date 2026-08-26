import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import PasswordInput from '@/components/common/PasswordInput';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import { formatDepartmentName } from '@/constants/departments';

/* ─── Role Governance Definitions ────────────────────────────── */

interface RoleGovernanceConfig {
  roleLabel: string;
  cardTitle: string;
  accessLevel: string;
  scopeType: 'SYSTEM' | 'REGISTRY' | 'DIRECTORATE';
  scopeTitle: string; // "Organizational Scope" / "Assigned Unit" / "Official Directorate"
  badgeColor: string;
  responsibilities: string[];
}

const ROLE_GOVERNANCE: Record<string, RoleGovernanceConfig> = {
  ADMIN: {
    roleLabel: 'Main Administrator',
    cardTitle: 'Administrator Profile',
    accessLevel: 'System-Wide Administration',
    scopeType: 'SYSTEM',
    scopeTitle: 'Organizational Scope',
    badgeColor: 'bg-[#C48D3F]/15 text-[#8A5D19] border-[#C48D3F]/30',
    responsibilities: [
      'Manage users and roles',
      'Manage directorates',
      'Route incoming/internal letters',
      'Verify/register approved outgoing letters',
      'Monitor system activity',
      'Manage system configuration',
      'Access audit logs',
    ],
  },
  REGISTRY_OFFICER: {
    roleLabel: 'Registry Officer',
    cardTitle: 'Registry Officer Profile',
    accessLevel: 'Registry Operations',
    scopeType: 'REGISTRY',
    scopeTitle: 'Assigned Unit',
    badgeColor: 'bg-[#6B5A8E]/15 text-[#4A3A6B] border-[#6B5A8E]/30',
    responsibilities: [
      'Receive incoming letters',
      'Verify basic information',
      'Scan/upload correspondence',
      'Assign registration numbers',
      'Record sender and received date',
      'Classify letters',
      'Set priority/confidentiality',
      'Route incoming letters to Main Administrator',
      'Dispatch approved outgoing letters',
      'Record dispatch information',
    ],
  },
  DEPARTMENT_MANAGER: {
    roleLabel: 'Directorate Manager',
    cardTitle: 'Directorate Manager Profile',
    accessLevel: 'Directorate Management',
    scopeType: 'DIRECTORATE',
    scopeTitle: 'Official Directorate',
    badgeColor: 'bg-[#526A55]/15 text-[#526A55] border-[#526A55]/30',
    responsibilities: [
      'Review correspondence',
      'Approve outgoing letters',
      'Request changes',
      'Assign incoming letters',
      'Assign internal letters',
      'Monitor correspondence within the Directorate',
      'Track pending work',
      'Review team activity',
    ],
  },
  EMPLOYEE: {
    roleLabel: 'Employee / Officer',
    cardTitle: 'Professional Profile',
    accessLevel: 'Standard User',
    scopeType: 'DIRECTORATE',
    scopeTitle: 'Official Directorate',
    badgeColor: 'bg-[#292A27]/10 text-[#292A27] border-[#292A27]/20',
    responsibilities: [
      'Create outgoing/internal letters',
      'Process assigned incoming letters',
      'Prepare outgoing correspondence',
      'Process internal correspondence',
      'Upload attachments',
      'Respond to assigned tasks',
      'Track assigned letters',
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

  const roleKey = user?.role || 'EMPLOYEE';
  const config = ROLE_GOVERNANCE[roleKey] || ROLE_GOVERNANCE.EMPLOYEE;

  // Resolve scope label dynamically based on user role and data
  const getScopeValue = () => {
    if (config.scopeType === 'SYSTEM') {
      return 'System-Wide Administration';
    }
    if (config.scopeType === 'REGISTRY') {
      return user?.unit_name || 'Central Registry';
    }
    // DIRECTORATE scope for Managers & Employees
    if (user?.department_name) {
      return formatDepartmentName(user.department_name);
    }
    return 'App Development Directorate';
  };

  const scopeValue = getScopeValue();
  const accountStatus = user?.status || (user?.is_active === false ? 'INACTIVE' : 'ACTIVE');

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
          Review your official role clearances, organizational scope, and account security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left 1/3: Role-Aware Profile Card ── */}
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#526A55] text-[#F5F3ED] rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#292A27] truncate">{user?.full_name || 'Personnel'}</h2>
                <p className="text-xs text-[#6B6A64] truncate mt-0.5">{user?.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border mt-2 ${config.badgeColor}`}>
                  {config.roleLabel}
                </span>
              </div>
            </div>

            {/* Structured Profile Fields */}
            <div className="pt-4 border-t border-[#D8D7D1]/60 space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] block">
                  Name
                </span>
                <span className="font-semibold text-[#292A27] text-sm mt-0.5 block">
                  {user?.full_name || 'Abebe Bikila'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] block">
                  Role
                </span>
                <span className="font-semibold text-[#526A55] mt-0.5 block">
                  {config.roleLabel}
                </span>
              </div>

              {/* Conditionally display Scope / Directorate / Unit according to role rules */}
              {config.scopeType !== 'SYSTEM' && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] block">
                    {config.scopeTitle}
                  </span>
                  <span className="font-semibold text-[#292A27] mt-0.5 block leading-snug">
                    {scopeValue}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] block">
                  Access Level
                </span>
                <span className="font-medium text-[#292A27] mt-0.5 block">
                  {config.accessLevel}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] block">
                  Account Status
                </span>
                <span className="inline-flex items-center text-[#4A6B4E] font-bold text-xs bg-[#4A6B4E]/10 px-2.5 py-0.5 rounded-full border border-[#4A6B4E]/20 mt-1">
                  <span className="w-1.5 h-1.5 bg-[#4A6B4E] rounded-full mr-1.5 animate-pulse" />
                  {accountStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="pt-3 border-t border-[#D8D7D1]/60">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-[#8B3232] border-[#8B3232]/30 hover:bg-[#8B3232]/10"
                onClick={handleLogout}
              >
                Sign Out of System
              </Button>
            </div>
          </Card>
        </div>

        {/* ── Right 2/3: Role Responsibilities & Security Form ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role-Based Responsibilities & Authorized Operations Card */}
          <Card className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#292A27]">{config.cardTitle} — Responsibilities</h3>
                <span className="text-[10px] font-mono font-bold text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-lg border border-[#526A55]/20 uppercase">
                  {config.accessLevel}
                </span>
              </div>
              <p className="text-xs text-[#6B6A64] mt-1 leading-relaxed">
                Authorized system operations and workflow duties mapped to your role clearance.
              </p>
            </div>

            <div className="pt-3 border-t border-[#D8D7D1]/60">
              <h4 className="text-xs font-bold text-[#292A27] uppercase tracking-wider mb-3">
                Responsibilities & Authorized Operations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {config.responsibilities.map((resp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#F9F8F5] border border-[#D8D7D1] flex items-center space-x-2.5 text-xs text-[#292A27] font-medium"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#526A55]/15 text-[#526A55] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      ✓
                    </span>
                    <span className="truncate">{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Security & Password Settings Card */}
          <Card className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#292A27]">Security & Password Settings</h3>
              <p className="text-xs text-[#6B6A64] mt-1">
                Update your account password regularly to protect official agency records and letter data.
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
                  Change Password
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
