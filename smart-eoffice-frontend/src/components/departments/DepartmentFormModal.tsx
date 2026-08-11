import React, { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Department, CreateDepartmentPayload } from '@/types/department';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDepartmentPayload) => Promise<void>;
  initialValue?: Department | null;
  isLoading?: boolean;
}

const initialFormState = {
  name: '',
  code: '',
  description: '',
};

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValue,
  isLoading = false,
}) => {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name,
        code: initialValue.code,
        description: initialValue.description || '',
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
  }, [initialValue, open]);

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Department name is required.';
    if (!form.code.trim()) nextErrors.code = 'Department code is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit Department' : 'Create Department'}
      description={initialValue ? 'Update department details and code.' : 'Add a new department for SITA administration.'}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Department Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          placeholder="Enter department name"
          disabled={isLoading}
        />

        <Input
          label="Department Code"
          value={form.code}
          onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
          error={errors.code}
          placeholder="Enter short department code"
          disabled={isLoading}
        />

        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Optional department description"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isLoading}>
          {initialValue ? 'Save Changes' : 'Create Department'}
        </Button>
      </div>
    </Modal>
  );
};

export default DepartmentFormModal;
