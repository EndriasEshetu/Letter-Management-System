import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select, { SelectOption } from '@/components/common/Select';
import letterService from '@/services/letterService';
import { useToast } from '@/components/common/Toast';

interface DispatchDialogProps {
  open: boolean;
  letterId: string;
  referenceNumber: string;
  subject: string;
  recipientName: string;
  recipientOrg: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DISPATCH_METHODS: SelectOption[] = [
  { value: 'OFFICIAL_EMAIL', label: 'Official Email' },
  { value: 'COURIER', label: 'Courier Service (EMS/DHL)' },
  { value: 'POSTAL_SERVICE', label: 'Postal Service' },
  { value: 'HAND_DELIVERY', label: 'Hand Delivery by Messenger' },
  { value: 'OTHER', label: 'Other Method' },
];

export const DispatchDialog: React.FC<DispatchDialogProps> = ({
  open,
  letterId,
  referenceNumber,
  subject,
  recipientName,
  recipientOrg,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [dispatchMethod, setDispatchMethod] = useState<'OFFICIAL_EMAIL' | 'COURIER' | 'POSTAL_SERVICE' | 'HAND_DELIVERY' | 'OTHER'>('OFFICIAL_EMAIL');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [courierRef, setCourierRef] = useState('');
  const [deliveryConfirmation, setDeliveryConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDispatch = async () => {
    setIsLoading(true);
    try {
      await letterService.recordDispatch(letterId, {
        dispatchMethod,
        dispatchDate,
        recipientName: recipientName || 'External Recipient',
        recipientOrganization: recipientOrg || 'External Entity',
        courierReferenceNumber: courierRef.trim() || undefined,
        deliveryConfirmation,
        deliveryDate: deliveryConfirmation ? dispatchDate : undefined,
      });
      addToast({
        type: 'success',
        title: 'Dispatch Recorded',
        message: `${referenceNumber} marked as dispatched to ${recipientOrg || recipientName}.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message || 'Could not record dispatch.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Official Letter Dispatch" size="md">
      <div className="space-y-4 py-2">
        <div className="p-3 rounded-xl bg-[#6B5A8E]/10 border border-[#6B5A8E]/20 text-xs text-[#292A27]">
          <p className="font-bold text-[#4A3A6B]">Outgoing Ref: {referenceNumber}</p>
          <p className="truncate text-[#6B6A64] mt-0.5">{subject}</p>
          <p className="text-[11px] text-[#6B6A64] font-medium mt-1">
            Recipient: <span className="text-[#292A27]">{recipientName} ({recipientOrg})</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
              Dispatch Method <span className="text-[#8B3232]">*</span>
            </label>
            <Select
              options={DISPATCH_METHODS}
              value={dispatchMethod}
              onChange={(v) => setDispatchMethod(v as any)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
              Dispatch Date <span className="text-[#8B3232]">*</span>
            </label>
            <Input
              type="date"
              value={dispatchDate}
              onChange={(e) => setDispatchDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1">
            Courier / Transmission Reference Number
          </label>
          <Input
            type="text"
            value={courierRef}
            onChange={(e) => setCourierRef(e.target.value)}
            placeholder="e.g., EMS-ETH-99201 / Email Tracking ID"
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            id="del-confirm"
            type="checkbox"
            checked={deliveryConfirmation}
            onChange={(e) => setDeliveryConfirmation(e.target.checked)}
            className="w-4 h-4 text-[#526A55] rounded border-[#D8D7D1] focus:ring-[#526A55]"
          />
          <label htmlFor="del-confirm" className="text-xs font-medium text-[#292A27]">
            Delivery evidence received / Delivery confirmed immediately
          </label>
        </div>

        <div className="pt-3 flex justify-end space-x-3 border-t border-[#D8D7D1]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDispatch} isLoading={isLoading}>
            Record Dispatch
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DispatchDialog;
