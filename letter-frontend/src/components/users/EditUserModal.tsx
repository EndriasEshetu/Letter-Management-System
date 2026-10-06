import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { User, UpdateUserPayload, UserRole } from '@/types/user';
import { Department } from '@/types/department';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateUserPayload) => Promise<void>;
  user: User | null;
  departments: Department[];
  isLoading?: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  departments,
  isLoading = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [newPassword, setNewPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && open) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setJobTitle(user.job_title || '');
      setRole(user.role || 'EMPLOYEE');
      setDepartmentId(user.department_id ? String(user.department_id) : '');
      setStatus(user.status || (user.is_active !== false ? 'ACTIVE' : 'INACTIVE'));
      setNewPassword('');
      setErrors({});
    }
  }, [user, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (newPassword && newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    const payload: UpdateUserPayload = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      job_title: jobTitle.trim() || undefined,
      role,
      department_id: departmentId ? Number(departmentId) : null,
      status,
    };

    if (newPassword.trim()) {
      payload.password = newPassword.trim();
    }

    await onSubmit(payload);
  };

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'DEPARTMENT_MANAGER', label: 'Department Manager' },
    { value: 'REGISTRY_OFFICER', label: 'Registry Officer' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  const deptOptions = [
    { value: '', label: 'No Department / Central Agency' },
    ...(departments ?? []).map((d) => ({
      value: String(d.id),
      label: d.name,
    })),
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active Account' },
    { value: 'INACTIVE', label: 'Inactive / Suspended' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Personnel Information"
      description={`Update official details, clearance, department, or reset password for ${user?.full_name || 'personnel'}.`}
      size="lg"
      closeOnOverlay={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Sara Jenkins"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={errors.fullName}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. sara.j@sita.gov.et"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            required
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +251 91 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Job Title"
            placeholder="e.g. IT Auditor"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          <Select
            label="Department / Directorate"
            options={deptOptions}
            value={departmentId}
            onChange={(val) => setDepartmentId(val)}
          />

          <Select
            label="Role / Clearance"
            options={roleOptions}
            value={role}
            onChange={(val) => setRole(val as UserRole)}
          />

          <Select
            label="Account Status"
            options={statusOptions}
            value={status}
            onChange={(val) => setStatus(val as 'ACTIVE' | 'INACTIVE')}
          />

          <Input
            label="Reset Password (Optional)"
            type="password"
            placeholder="Leave blank to keep current password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
            }}
            error={errors.newPassword}
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
