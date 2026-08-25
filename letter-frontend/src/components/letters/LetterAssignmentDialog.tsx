import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select, { SelectOption } from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import letterService from '@/services/letterService';
import { useToast } from '@/components/common/Toast';
import { LetterPriority } from '@/types/letter';

interface LetterAssignmentDialogProps {
  open: boolean;
  letterId: string;
  referenceNumber: string;
  subject: string;
  departmentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OFFICER_OPTIONS: SelectOption[] = [
  { value: 'Endrias Eshetu', label: 'Endrias Eshetu (Senior IT Officer)' },
  { value: 'Sara Jenkins', label: 'Sara Jenkins (Officer)' },
  { value: 'Michael K.', label: 'Michael K. (Systems Officer)' },
  { value: 'Tariku Bikila', label: 'Tariku Bikila (Officer)' },
];

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
  departmentName,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [officerName, setOfficerName] = useState('Endrias Eshetu');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<LetterPriority>('HIGH');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAssign = async () => {
    if (!officerName) return;
    setIsLoading(true);
    try {
      await letterService.assignToOfficer(letterId, {
        officerName,
        dueDate: dueDate || undefined,
        instructions: instructions.trim() || undefined,
        priority,
      });
      addToast({
        type: 'success',
        title: 'Task Assigned',
        message: `${referenceNumber} assigned to ${officerName}.`,
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
    <Modal open={open} onClose={onClose} title="Assign Responsible Officer" size="md">
      <div className="space-y-4 py-2">
        <div className="p-3 rounded-xl bg-[#526A55]/10 border border-[#526A55]/20 text-xs text-[#292A27]">
          <p className="font-bold text-[#526A55]">{referenceNumber} ({departmentName})</p>
          <p className="truncate text-[#6B6A64] mt-0.5">{subject}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
              Select Officer <span className="text-[#8B3232]">*</span>
            </label>
            <Select options={OFFICER_OPTIONS} value={officerName} onChange={setOfficerName} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
              Priority
            </label>
            <Select options={PRIORITY_OPTIONS} value={priority} onChange={(v) => setPriority(v as LetterPriority)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
            Action Response Deadline (Due Date)
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
            Manager Instructions & Action Scope
          </label>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Specify what action or response document the officer should prepare..."
            rows={3}
          />
        </div>

        <div className="pt-3 flex justify-end space-x-3 border-t border-[#D8D7D1]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign} isLoading={isLoading}>
            Assign Officer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LetterAssignmentDialog;
