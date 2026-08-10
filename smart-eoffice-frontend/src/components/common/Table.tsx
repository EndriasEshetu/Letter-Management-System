import React from 'react';

/* ─── Sub-components ─────────────────────────────────────── */

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}
const Th: React.FC<ThProps> = ({ children, className = '', ...props }) => (
  <th
    className={`px-4 py-3 text-left text-xs font-semibold text-[#6B6A64] uppercase tracking-wide whitespace-nowrap ${className}`}
    {...props}
  >
    {children}
  </th>
);

interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}
const Td: React.FC<TdProps> = ({ children, className = '', ...props }) => (
  <td
    className={`px-4 py-3.5 text-sm text-[#252622] align-middle ${className}`}
    {...props}
  >
    {children}
  </td>
);

interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}
const Tr: React.FC<TrProps> = ({ children, selected = false, onClick, className = '', ...props }) => (
  <tr
    onClick={onClick}
    className={`border-b border-[#D8D7D1]/40 transition-colors last:border-b-0 ${
      onClick ? 'cursor-pointer' : ''
    } ${selected ? 'bg-[#DCE3C8]/30' : 'hover:bg-[#ECEAE3]/60'} ${className}`}
    {...props}
  >
    {children}
  </tr>
);

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}
const Header: React.FC<HeaderProps> = ({ children, className = '' }) => (
  <thead className={`bg-[#ECEAE3] border-b border-[#D8D7D1]/60 ${className}`}>
    <tr>{children}</tr>
  </thead>
);

interface BodyProps {
  children: React.ReactNode;
  className?: string;
}
const Body: React.FC<BodyProps> = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-[#D8D7D1]/30 ${className}`}>{children}</tbody>
);

/* ─── Root Table ─────────────────────────────────────────── */

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

type TableComponent = React.FC<TableProps> & {
  Header: typeof Header;
  Body: typeof Body;
  Th: typeof Th;
  Td: typeof Td;
  Tr: typeof Tr;
};

const Table: TableComponent = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto rounded-[1.25rem] border border-[#292A27]/08 bg-[#F9F8F5] ${className}`}>
    <table className="w-full min-w-full border-collapse">{children}</table>
  </div>
);

Table.Header = Header;
Table.Body = Body;
Table.Th = Th;
Table.Td = Td;
Table.Tr = Tr;

export { Table };
export default Table;
