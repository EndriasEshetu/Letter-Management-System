import React, { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Select, { SelectOption } from '@/components/common/Select';
import Button from '@/components/common/Button';
import { Department } from '@/types/department';
import { User } from '@/types/user';

interface AssignManagerModalProps {
  open: boolean;
  onClose: () => void;
  department: Department | null;
  managers: User[];
  selectedManagerId?: string;
  onChangeManagerId: (managerId: string) => void;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
}

export const AssignManagerModal: React.FC<AssignManagerModalProps> = ({
  open,
  onClose,
  department,
  managers,
  selectedManagerId = '',
  onChangeManagerId,
  onSubmit,
  isLoading = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [open, department]);

  const handleSubmit = async () => {
    if (!selectedManagerId) {
      setError('Please select a department manager.');
      return;
    }
    await onSubmit();
  };

  const options: SelectOption[] = [
    { value: '', label: 'Select a department manager' },
    ...managers.map((manager) => ({
      value: String(manager.id),
      label: `${manager.full_name} (${manager.department_name || 'No department'})`,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Department Manager"
      description={department ? `Department: ${department.name}` : 'Select a manager for this department.'}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#292A27] mb-1.5">Current Manager</label>
          <div className="rounded-xl border border-[#D8D7D1] bg-[#F9F8F6] px-4 py-3 text-sm text-[#292A27]">
            {department?.manager_name || 'Unassigned'}
          </div>
        </div>

        <Select
          label="New Manager"
          placeholder="Select a department manager"
          options={options}
          value={selectedManagerId}
          onChange={onChangeManagerId}
          error={error || undefined}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isLoading}>
          Assign
        </Button>
      </div>
    </Modal>
  );
};

export default AssignManagerModal;
