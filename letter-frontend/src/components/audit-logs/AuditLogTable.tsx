import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { AuditLog } from '@/types/audit';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

/* ─── Action Badge Colors ─────────────────────────────────── */
const getActionBadge = (action: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    CREATE:            { bg: 'bg-[#4A6B4E]/15',  text: 'text-[#4A6B4E]'  },
    APPROVE:           { bg: 'bg-[#4A6B4E]/15',  text: 'text-[#4A6B4E]'  },
    RESTORE:           { bg: 'bg-[#4A6B4E]/15',  text: 'text-[#4A6B4E]'  },
    LOGIN:             { bg: 'bg-[#526A55]/15',  text: 'text-[#526A55]'  },
    DOWNLOAD:          { bg: 'bg-[#526A55]/15',  text: 'text-[#526A55]'  },
    UPDATE:            { bg: 'bg-[#C48D3F]/15',  text: 'text-[#8A5D19]'  },
    PERMISSION_CHANGE: { bg: 'bg-[#C48D3F]/15',  text: 'text-[#8A5D19]'  },
    ARCHIVE:           { bg: 'bg-[#6B6A64]/15',  text: 'text-[#6B6A64]'  },
    LOGOUT:            { bg: 'bg-[#6B6A64]/15',  text: 'text-[#6B6A64]'  },
    REJECT:            { bg: 'bg-[#8B3232]/15',  text: 'text-[#8B3232]'  },
    DELETE:            { bg: 'bg-[#8B3232]/15',  text: 'text-[#8B3232]'  },
  };
  return map[action] ?? { bg: 'bg-[#D8D7D1]/50', text: 'text-[#292A27]' };
};

const getEntityBadge = (entityType: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    DOCUMENT:   { bg: 'bg-[#526A55]/10', text: 'text-[#526A55]'  },
    USER:       { bg: 'bg-[#C48D3F]/10', text: 'text-[#8A5D19]'  },
    DEPARTMENT: { bg: 'bg-[#292A27]/08', text: 'text-[#292A27]'  },
    WORKFLOW:   { bg: 'bg-[#4A6B4E]/10', text: 'text-[#4A6B4E]'  },
    SYSTEM:     { bg: 'bg-[#6B6A64]/10', text: 'text-[#6B6A64]'  },
    ARCHIVE:    { bg: 'bg-[#6B6A64]/10', text: 'text-[#6B6A64]'  },
  };
  return map[entityType] ?? { bg: 'bg-[#D8D7D1]/50', text: 'text-[#292A27]' };
};

/* ─── Date Formatter ─────────────────────────────────────── */
const formatDate = (isoString: string): { date: string; time: string } => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: isoString, time: '' };
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { date, time };
};

/* ─── Details Safe Preview ───────────────────────────────── */
const parseDetails = (details: string | Record<string, any> | undefined): string => {
  if (!details) return '';
  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  }
  return JSON.stringify(details, null, 2);
};

/* ─── Component ─────────────────────────────────────────── */
interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  return (
    <>
      <Table>
        <Table.Header>
          <Table.Th scope="col">Date / Time</Table.Th>
          <Table.Th scope="col">User</Table.Th>
          <Table.Th scope="col">Action</Table.Th>
          <Table.Th scope="col">Entity Type</Table.Th>
          <Table.Th scope="col">Entity ID</Table.Th>
          <Table.Th scope="col">IP Address</Table.Th>
          <Table.Th scope="col">Details</Table.Th>
        </Table.Header>

        <Table.Body>
          {logs.map((log) => {
            const { date, time } = formatDate(log.created_at);
            const actionStyle = getActionBadge(log.action);
            const entityStyle = getEntityBadge(log.entity_type);
            const detailsStr = parseDetails(log.details);

            return (
              <Table.Tr key={log.id}>
                {/* Date */}
                <Table.Td>
                  <div className="text-xs font-semibold text-[#292A27] whitespace-nowrap">{date}</div>
                  <div className="text-[11px] text-[#6B6A64] font-mono mt-0.5">{time}</div>
                </Table.Td>

                {/* User */}
                <Table.Td>
                  <div className="font-semibold text-[#292A27] text-xs whitespace-nowrap">{log.user_name}</div>
                  {log.user_email && (
                    <div className="text-[11px] text-[#6B6A64] truncate max-w-[160px]" title={log.user_email}>
                      {log.user_email}
                    </div>
                  )}
                </Table.Td>

                {/* Action */}
                <Table.Td>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${actionStyle.bg} ${actionStyle.text}`}
                  >
                    {log.action.replace('_', ' ')}
                  </span>
                </Table.Td>

                {/* Entity Type */}
                <Table.Td>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${entityStyle.bg} ${entityStyle.text}`}
                  >
                    {log.entity_type}
                  </span>
                </Table.Td>

                {/* Entity ID */}
                <Table.Td>
                  <span
                    className="font-mono text-[11px] text-[#526A55] bg-[#526A55]/08 px-1.5 py-0.5 rounded truncate block max-w-[120px]"
                    title={log.entity_id}
                  >
                    {log.entity_id}
                  </span>
                </Table.Td>

                {/* IP Address */}
                <Table.Td>
                  <span className="font-mono text-xs text-[#6B6A64]">
                    {log.ip_address || '—'}
                  </span>
                </Table.Td>

                {/* Details */}
                <Table.Td>
                  {detailsStr ? (
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#526A55] hover:text-[#435746] focus:outline-none focus:ring-2 focus:ring-[#526A55] rounded-md px-1 py-0.5 transition-colors"
                      aria-label={`View details for audit log ${log.id}`}
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  ) : (
                    <span className="text-xs text-[#8A8983]">—</span>
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Body>
      </Table>

      {/* Details Modal */}
      {selectedLog && (
        <Modal
          open={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Details"
          description={`${selectedLog.action} · ${selectedLog.entity_type} · ${selectedLog.entity_id}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F9F8F6] rounded-xl p-3 border border-[#D8D7D1]">
                <p className="text-[#6B6A64] font-semibold uppercase tracking-wide mb-0.5">User</p>
                <p className="font-bold text-[#292A27]">{selectedLog.user_name}</p>
                {selectedLog.user_email && (
                  <p className="text-[#6B6A64] font-mono text-[11px]">{selectedLog.user_email}</p>
                )}
              </div>
              <div className="bg-[#F9F8F6] rounded-xl p-3 border border-[#D8D7D1]">
                <p className="text-[#6B6A64] font-semibold uppercase tracking-wide mb-0.5">Timestamp</p>
                <p className="font-bold text-[#292A27] font-mono text-[11px]">{selectedLog.created_at}</p>
              </div>
              <div className="bg-[#F9F8F6] rounded-xl p-3 border border-[#D8D7D1]">
                <p className="text-[#6B6A64] font-semibold uppercase tracking-wide mb-0.5">IP Address</p>
                <p className="font-bold text-[#292A27] font-mono">{selectedLog.ip_address || '—'}</p>
              </div>
              <div className="bg-[#F9F8F6] rounded-xl p-3 border border-[#D8D7D1]">
                <p className="text-[#6B6A64] font-semibold uppercase tracking-wide mb-0.5">Record ID</p>
                <p className="font-bold text-[#526A55] font-mono text-[11px] truncate">{selectedLog.entity_id}</p>
              </div>
            </div>

            {/* Details JSON */}
            {selectedLog.details && (
              <div>
                <p className="text-xs font-semibold text-[#6B6A64] uppercase tracking-wide mb-2">
                  Event Details
                </p>
                <pre className="bg-[#292A27] text-[#DCE3C8] rounded-2xl p-4 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-64 whitespace-pre-wrap break-all">
                  {parseDetails(selectedLog.details)}
                </pre>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AuditLogTable;
