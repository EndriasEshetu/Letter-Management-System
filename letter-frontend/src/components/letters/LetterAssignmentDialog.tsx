import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select, { SelectOption } from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import letterService from '@/services/letterService';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/hooks/useAuth';
import { LetterPriority } from '@/types/letter';
import DepartmentEmployeeDropdown from './DepartmentEmployeeDropdown';

interface LetterAssignmentDialogProps {
  open: boolean;
  letterId: string;
  referenceNumber: string;
  subject: string;
  departmentName?: string;
  departmentId?: string | number;
  onClose: () => void;
  onSuccess: () => void;
}

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'LOW', label: 'Low' },
];

export const LetterAssignmentDialog: React.FC<LetterAssignmentDialogProps> = ({
  open,
  letterId,
  referenceNumber,
  subject,
  departmentName: initialDeptName,
  departmentId: initialDeptId,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Determine effective department based on manager role or letter metadata
  const effectiveDepartmentName = useMemo(() => {
    if (user?.role === 'DEPARTMENT_MANAGER' && user?.department_name) {
      return user.department_name;
    }
    return initialDeptName || user?.department_name || 'App Development Directorate';
  }, [user, initialDeptName]);

  const effectiveDepartmentId: string | number | undefined = useMemo(() => {
    if (user?.role === 'DEPARTMENT_MANAGER' && user?.department_id) {
      return user.department_id;
    }
    const id = initialDeptId ?? user?.department_id;
    return id != null ? id : undefined;
  }, [user, initialDeptId]);

  const [officerName, setOfficerName] = useState('');
  const [officerId, setOfficerId] = useState<number | string | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<LetterPriority>('HIGH');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setOfficerName('');
      setOfficerId(undefined);
      setDueDate('');
      setPriority('HIGH');
      setInstructions('');
      setValidationError(null);
    }
  }, [open]);

  const handleOfficerChange = (name: string, id?: number | string) => {
    setOfficerName(name);
    setOfficerId(id);
    if (name) {
      setValidationError(null);
    }
  };

  const handleAssign = async () => {
    if (!officerName.trim()) {
      setValidationError('Please select an employee or officer from the dropdown.');
      return;
    }

    setIsLoading(true);
    setValidationError(null);

    try {
      await letterService.assignToOfficer(letterId, {
        officerName: officerName.trim(),
        officerId,
        departmentId: effectiveDepartmentId,
        departmentName: effectiveDepartmentName,
        dueDate: dueDate || undefined,
        instructions: instructions.trim() || undefined,
        priority,
      });

      addToast({
        type: 'success',
        title: 'Task Assigned',
        message: `${referenceNumber} assigned to ${officerName} (${effectiveDepartmentName}).`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Assignment Failed',
        message: err.message || 'Could not assign officer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Work to Department Staff" size="md">
      <div className="space-y-4 py-2">
        {/* Document & Department Context Header */}
        <div className="p-3.5 rounded-xl bg-[#526A55]/10 border border-[#526A55]/20 text-xs text-[#292A27]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[#526A55] tracking-wide">{referenceNumber}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#292A27] bg-white/80 px-2 py-0.5 rounded-md border border-[#526A55]/20">
              🏛️ {effectiveDepartmentName}
            </span>
          </div>
          <p className="truncate text-[#6B6A64] mt-1 font-medium">{subject}</p>
          {user?.role === 'DEPARTMENT_MANAGER' && (
            <p className="text-[11px] text-[#526A55] font-medium mt-1">
              ✓ Showing personnel from your assigned directorate
            </p>
          )}
        </div>

        {/* Department Employee Dropdown Button */}
        <div>
          <DepartmentEmployeeDropdown
            label="Assigned Officer / Employee"
            required
            departmentName={effectiveDepartmentName}
            departmentId={effectiveDepartmentId}
            value={officerName}
            selectedOfficerId={officerId}
            onChange={handleOfficerChange}
            error={validationError || undefined}
            placeholder={`Select employee from ${effectiveDepartmentName}...`}
          />
        </div>

        {/* Priority & Deadline Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
              Priority
            </label>
            <Select
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(v) => setPriority(v as LetterPriority)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
              Response Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Work Instructions & Scope */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
            Manager Instructions & Action Scope
          </label>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Specify what action, response memo, or task the employee should carry out..."
            rows={3}
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 flex justify-end space-x-3 border-t border-[#D8D7D1]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign} isLoading={isLoading}>
            Assign Work
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LetterAssignmentDialog;
