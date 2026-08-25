import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Select, { SelectOption } from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import letterService from '@/services/letterService';
import { useToast } from '@/components/common/Toast';

interface LetterRoutingDialogProps {
  open: boolean;
  letterId: string;
  referenceNumber: string;
  subject: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: 'ICT Governance', label: 'ICT Governance Directorate' },
  { value: 'Finance & Planning', label: 'Finance & Planning Directorate' },
  { value: 'Legal Services', label: 'Legal Services Directorate' },
  { value: 'Human Resources', label: 'Human Resources Directorate' },
  { value: 'Procurement & Finance', label: 'Procurement Directorate' },
  { value: 'General Administration', label: 'General Administration' },
  { value: 'Urban Development', label: 'Urban Development Directorate' },
];

export const LetterRoutingDialog: React.FC<LetterRoutingDialogProps> = ({
  open,
  letterId,
  referenceNumber,
  subject,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState('ICT Governance');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoute = async () => {
    if (!selectedDepartment) return;
    setIsLoading(true);
    try {
      await letterService.routeToDepartment(letterId, selectedDepartment, notes.trim());
      addToast({
        type: 'success',
        title: 'Letter Routed',
        message: `${referenceNumber} routed to ${selectedDepartment} Department.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Routing Failed',
        message: err.message || 'Could not route letter.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Administrative Letter Routing" size="md">
      <div className="space-y-4 py-2">
        <div className="p-3 rounded-xl bg-[#526A55]/10 border border-[#526A55]/20 text-xs text-[#292A27]">
          <p className="font-bold text-[#526A55]">{referenceNumber}</p>
          <p className="truncate text-[#6B6A64] mt-0.5">{subject}</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
            Destination Department <span className="text-[#8B3232]">*</span>
          </label>
          <Select
            options={DEPARTMENT_OPTIONS}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
            Routing Instructions / Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add specific instructions for the department manager..."
            rows={3}
          />
        </div>

        <div className="pt-3 flex justify-end space-x-3 border-t border-[#D8D7D1]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRoute} isLoading={isLoading}>
            Route to Department
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LetterRoutingDialog;
