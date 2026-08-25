import React, { useState, useRef } from 'react';
import letterService from '@/services/letterService';
import { useToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import Select, { SelectOption } from '@/components/common/Select';

interface RegisterLetterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type LetterDirection = 'INCOMING' | 'OUTGOING' | 'INTERNAL';

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'General / Correspondence', label: 'General / Correspondence' },
  { value: 'Finance / Budget', label: 'Finance / Budget' },
  { value: 'Finance / Reports', label: 'Finance / Reports' },
  { value: 'Legal / Audit', label: 'Legal / Audit' },
  { value: 'Legal / Contracts', label: 'Legal / Contracts' },
  { value: 'HR / Administration', label: 'HR / Administration' },
  { value: 'HR / Policies', label: 'HR / Policies' },
  { value: 'ICT / Partnerships', label: 'ICT / Partnerships' },
  { value: 'ICT / Audit', label: 'ICT / Audit' },
  { value: 'Events / International', label: 'Events / International' },
  { value: 'Procurement / Supplies', label: 'Procurement / Supplies' },
  { value: 'Public Relations', label: 'Public Relations' },
];

const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: 'Finance & Planning', label: 'Finance & Planning' },
  { value: 'Legal Services', label: 'Legal Services' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'ICT Governance', label: 'ICT Governance' },
  { value: 'Public Works', label: 'Public Works' },
  { value: 'General Administration', label: 'General Administration' },
  { value: 'City Clerk', label: 'City Clerk' },
  { value: 'Urban Development', label: 'Urban Development' },
];

const CONFIDENTIALITY_OPTIONS: SelectOption[] = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'CONFIDENTIAL', label: 'Confidential' },
  { value: 'RESTRICTED', label: 'Restricted' },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'LOW', label: 'Low' },
];

const MEMO_TYPE_OPTIONS: SelectOption[] = [
  { value: 'MEMORANDUM', label: 'Memorandum (Memo)' },
  { value: 'INTERNAL', label: 'Internal Correspondence' },
  { value: 'NOTIFICATION', label: 'Internal Notification' },
  { value: 'ADMINISTRATIVE', label: 'Administrative Notice' },
];

const OUTGOING_TYPE_OPTIONS: SelectOption[] = [
  { value: 'OUTGOING', label: 'Outgoing Letter' },
  { value: 'RESPONSE', label: 'Response / Reply' },
  { value: 'OFFICIAL', label: 'Official Communication' },
  { value: 'INVITATION', label: 'Invitation' },
  { value: 'NOTIFICATION', label: 'Notification' },
];

const INCOMING_TYPE_OPTIONS: SelectOption[] = [
  { value: 'INCOMING', label: 'Incoming Letter' },
  { value: 'REQUEST', label: 'Request' },
  { value: 'INVITATION', label: 'Invitation' },
  { value: 'OFFICIAL', label: 'Official Notice' },
  { value: 'CORRESPONDENCE', label: 'Correspondence' },
];

const DIRECTION_TABS: { key: LetterDirection; label: string; icon: React.ReactNode }[] = [
  {
    key: 'INCOMING',
    label: 'Incoming',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  },
  {
    key: 'OUTGOING',
    label: 'Outgoing',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    key: 'INTERNAL',
    label: 'Internal',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

const InputLabel: React.FC<{ children: React.ReactNode; htmlFor?: string; required?: boolean }> = ({
  children,
  htmlFor,
  required,
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1.5"
  >
    {children} {required && <span className="text-[#8B3232] ml-0.5">*</span>}
  </label>
);

const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { id: string }
> = (props) => (
  <input
    {...props}
    className={`w-full px-3.5 py-2.5 text-sm bg-[#F9F8F5] border border-[#D8D7D1] rounded-xl text-[#292A27] placeholder-[#B0AFA9] focus:outline-none focus:ring-2 focus:ring-[#526A55] focus:border-transparent transition-colors ${props.className || ''}`}
  />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }> = (
  props
) => (
  <textarea
    {...props}
    className={`w-full px-3.5 py-2.5 text-sm bg-[#F9F8F5] border border-[#D8D7D1] rounded-xl text-[#292A27] placeholder-[#B0AFA9] focus:outline-none focus:ring-2 focus:ring-[#526A55] focus:border-transparent transition-colors resize-none ${props.className || ''}`}
  />
);

export const RegisterLetterModal: React.FC<RegisterLetterModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [direction, setDirection] = useState<LetterDirection>('INCOMING');
  const [letterType, setLetterType] = useState('INCOMING');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [sender, setSender] = useState('');
  const [senderOrganization, setSenderOrganization] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientOrganization, setRecipientOrganization] = useState('');
  const [category, setCategory] = useState('General / Correspondence');
  const [department, setDepartment] = useState('General Administration');
  const [confidentiality, setConfidentiality] = useState('INTERNAL');
  const [priority, setPriority] = useState('NORMAL');
  const [dateReceivedSent, setDateReceivedSent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDirectionChange = (dir: LetterDirection) => {
    setDirection(dir);
    // Reset type to direction's default
    setLetterType(dir);
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!subject.trim()) errs.subject = 'Subject is required.';
    if (direction === 'INCOMING' && !sender.trim()) errs.sender = 'Sender name is required.';
    if (direction === 'OUTGOING' && !recipient.trim()) errs.recipient = 'Recipient name is required.';
    if (!department) errs.department = 'Department is required.';
    if (!file) errs.file = 'Please attach the letter document.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('subject', subject.trim());
    formData.append('letterType', letterType);
    formData.append('description', description.trim());
    formData.append('sender', sender.trim());
    formData.append('senderOrganization', senderOrganization.trim());
    formData.append('recipient', recipient.trim());
    formData.append('recipientOrganization', recipientOrganization.trim());
    formData.append('category', category);
    formData.append('department_name', department);
    formData.append('confidentialityLevel', confidentiality);
    formData.append('priority', priority);
    if (dateReceivedSent) formData.append(direction === 'INCOMING' ? 'dateReceived' : 'dateSent', dateReceivedSent);
    if (file) formData.append('file', file);

    try {
      await letterService.createLetter(formData, setUploadProgress);
      addToast({
        type: 'success',
        title: 'Letter Registered',
        message: `"${subject}" has been registered successfully.`,
      });
      onSuccess();
      handleClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Could not register the letter. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    // Reset state
    setDirection('INCOMING');
    setLetterType('INCOMING');
    setSubject('');
    setDescription('');
    setSender('');
    setSenderOrganization('');
    setRecipient('');
    setRecipientOrganization('');
    setCategory('General / Correspondence');
    setDepartment('General Administration');
    setConfidentiality('INTERNAL');
    setPriority('NORMAL');
    setDateReceivedSent('');
    setFile(null);
    setErrors({});
    setUploadProgress(0);
    onClose();
  };

  if (!open) return null;

  const typeOptions =
    direction === 'INCOMING'
      ? INCOMING_TYPE_OPTIONS
      : direction === 'OUTGOING'
      ? OUTGOING_TYPE_OPTIONS
      : MEMO_TYPE_OPTIONS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292A27]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-letter-title"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-[#F5F3ED] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#D8D7D1]">
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-[#D8D7D1] bg-[#ECEAE3] flex items-center justify-between">
          <div>
            <h2 id="register-letter-title" className="text-lg font-bold text-[#292A27]">
              Register New Letter
            </h2>
            <p className="text-xs text-[#6B6A64] mt-0.5">
              Register an incoming, outgoing, or internal official letter.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-[#6B6A64] hover:text-[#292A27] hover:bg-[#D8D7D1]/50 rounded-xl transition-colors focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Direction Tab Bar */}
        <div className="px-7 pt-5 pb-0">
          <div className="flex space-x-1 bg-[#ECEAE3] p-1 rounded-2xl border border-[#D8D7D1]">
            {DIRECTION_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleDirectionChange(tab.key)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  direction === tab.key
                    ? 'bg-[#F5F3ED] text-[#292A27] shadow-sm border border-[#D8D7D1]/60'
                    : 'text-[#6B6A64] hover:text-[#292A27]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          {/* Letter Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel htmlFor="letter-type">Letter Type <span className="text-[#8B3232]">*</span></InputLabel>
              <Select
                options={typeOptions}
                value={letterType}
                onChange={setLetterType}
              />
            </div>
            <div>
              <InputLabel htmlFor="priority">Priority</InputLabel>
              <Select options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
            </div>
          </div>

          {/* Subject */}
          <div>
            <InputLabel htmlFor="subject" required>Subject / Title</InputLabel>
            <TextInput
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Request for Budget Allocation Q4 FY2026"
            />
            {errors.subject && <p className="text-xs text-[#8B3232] mt-1">{errors.subject}</p>}
          </div>

          {/* Sender — for INCOMING */}
          {(direction === 'INCOMING') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <InputLabel htmlFor="sender" required>Sender Name</InputLabel>
                <TextInput
                  id="sender"
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g., Ato Kebede Tadesse"
                />
                {errors.sender && <p className="text-xs text-[#8B3232] mt-1">{errors.sender}</p>}
              </div>
              <div>
                <InputLabel htmlFor="sender-org">Sender Organization</InputLabel>
                <TextInput
                  id="sender-org"
                  type="text"
                  value={senderOrganization}
                  onChange={(e) => setSenderOrganization(e.target.value)}
                  placeholder="e.g., Ministry of Finance"
                />
              </div>
            </div>
          )}

          {/* Recipient — for OUTGOING */}
          {(direction === 'OUTGOING') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <InputLabel htmlFor="recipient" required>Recipient Name</InputLabel>
                <TextInput
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g., Director General"
                />
                {errors.recipient && <p className="text-xs text-[#8B3232] mt-1">{errors.recipient}</p>}
              </div>
              <div>
                <InputLabel htmlFor="recipient-org">Recipient Organization</InputLabel>
                <TextInput
                  id="recipient-org"
                  type="text"
                  value={recipientOrganization}
                  onChange={(e) => setRecipientOrganization(e.target.value)}
                  placeholder="e.g., SITA"
                />
              </div>
            </div>
          )}

          {/* For INTERNAL — both sender and recipient */}
          {direction === 'INTERNAL' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <InputLabel htmlFor="sender">From (Person / Unit)</InputLabel>
                <TextInput
                  id="sender"
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g., HR Director"
                />
              </div>
              <div>
                <InputLabel htmlFor="recipient">To (Person / Unit)</InputLabel>
                <TextInput
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g., All Department Heads"
                />
              </div>
            </div>
          )}

          {/* Category & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel htmlFor="category">Category</InputLabel>
              <Select options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
            </div>
            <div>
              <InputLabel htmlFor="department" required>Department</InputLabel>
              <Select options={DEPARTMENT_OPTIONS} value={department} onChange={setDepartment} />
              {errors.department && <p className="text-xs text-[#8B3232] mt-1">{errors.department}</p>}
            </div>
          </div>

          {/* Date + Confidentiality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel htmlFor="date-received">
                {direction === 'INCOMING' ? 'Date Received' : 'Date Sent'}
              </InputLabel>
              <TextInput
                id="date-received"
                type="date"
                value={dateReceivedSent}
                onChange={(e) => setDateReceivedSent(e.target.value)}
              />
            </div>
            <div>
              <InputLabel htmlFor="confidentiality">Confidentiality</InputLabel>
              <Select
                options={CONFIDENTIALITY_OPTIONS}
                value={confidentiality}
                onChange={setConfidentiality}
              />
            </div>
          </div>

          {/* Summary/Description */}
          <div>
            <InputLabel htmlFor="description">Summary / Description</InputLabel>
            <TextArea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the purpose and contents of this letter..."
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div>
            <InputLabel htmlFor="file-upload" required>Letter Document (Attachment)</InputLabel>
            <div
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                file
                  ? 'border-[#526A55]/50 bg-[#526A55]/05'
                  : errors.file
                  ? 'border-[#8B3232]/50 bg-[#8B3232]/03'
                  : 'border-[#D8D7D1] hover:border-[#526A55]/40'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files[0];
                if (dropped) setFile(dropped);
              }}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />

              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-9 h-9 bg-[#526A55]/10 text-[#526A55] rounded-xl flex items-center justify-center font-bold text-xs">
                    {file.name.split('.').pop()?.toUpperCase().slice(0, 3) || 'DOC'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#292A27] truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-[#6B6A64]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <svg className="w-8 h-8 text-[#D8D7D1] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm font-medium text-[#6B6A64]">
                    Drop file here or <span className="text-[#526A55] font-bold">browse</span>
                  </p>
                  <p className="text-xs text-[#8A8983] mt-1">PDF, DOCX, PNG, JPG (max 20 MB)</p>
                </div>
              )}
            </div>
            {errors.file && <p className="text-xs text-[#8B3232] mt-1">{errors.file}</p>}
          </div>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-[#6B6A64]">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#D8D7D1] rounded-full h-1.5">
                <div
                  className="bg-[#526A55] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-[#D8D7D1] bg-[#ECEAE3] flex items-center justify-end space-x-3">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit as any}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Register Letter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterLetterModal;
