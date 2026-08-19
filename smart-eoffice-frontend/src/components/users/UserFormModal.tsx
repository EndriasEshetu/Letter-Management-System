import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { CreateUserPayload, UserRole } from '@/types/user';
import { Department } from '@/types/department';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
  departments: Department[];
  isLoading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  departments,
  isLoading = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState<string>('1');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    await onSubmit({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      job_title: jobTitle.trim() || undefined,
      role,
      department_id: Number(departmentId) || 1,
      status: 'ACTIVE',
    });

    // Reset fields
    setFullName('');
    setEmail('');
    setPhone('');
    setJobTitle('');
    setRole('EMPLOYEE');
    setErrors({});
  };

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'DEPARTMENT_MANAGER', label: 'Department Manager' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  const deptOptions = departments.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New User"
      description="Create a new personnel account and assign department clearance."
      size="lg"
      closeOnOverlay={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Create Personnel Account
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
            label="Phone Number (Optional)"
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
            label="Department"
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
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
