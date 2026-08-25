import React from 'react';
import { RecentLetterItem } from '@/services/dashboardService';
import Table from '@/components/common/Table';
import Badge, { LetterStatus } from '@/components/common/Badge';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';

interface RecentDocumentsTableProps {
  documents: RecentLetterItem[];
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export const RecentDocumentsTable: React.FC<RecentDocumentsTableProps> = ({
  documents,
  title = 'Recent Letters',
  subtitle,
  emptyTitle = 'No letters found',
  emptyDescription = 'There are no letters to display in this list.',
  className = '',
}) => {
  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#292A27]">{title}</h3>
          {subtitle && <p className="text-xs text-[#6B6A64]">{subtitle}</p>}
        </div>
      </div>

      {!documents || documents.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Table>
          <Table.Header>
            <Table.Th>Letter Subject</Table.Th>
            <Table.Th>Department</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Header>
          <Table.Body>
            {documents.map((doc) => (
              <Table.Tr key={doc.id}>
                <Table.Td>
                  <div>
                    <span className="font-medium text-[#292A27] block truncate max-w-xs md:max-w-md">
                      {doc.subject}
                    </span>
                    <span className="text-xs text-[#8A8983] font-mono">Ref: {doc.referenceNumber}</span>
                  </div>
                </Table.Td>
                <Table.Td>
                  <span className="text-xs font-medium text-[#6B6A64]">{doc.department}</span>
                </Table.Td>
                <Table.Td>
                  <Badge status={doc.status as LetterStatus} dot />
                </Table.Td>
                <Table.Td>
                  <span className="text-xs text-[#6B6A64]">{doc.date}</span>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Body>
        </Table>
      )}
    </Card>
  );
};

export default RecentDocumentsTable;
