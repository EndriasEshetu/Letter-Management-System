import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import departmentService from '@/services/departmentService';
import { DepartmentDetails, DepartmentMember } from '@/types/department';
import {
  Building2,
  UserCheck,
  Users,
  Mail,
  Phone,
  Briefcase,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface DepartmentDetailsModalProps {
  open: boolean;
  departmentId: number | string | null;
  onClose: () => void;
}

export const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({
  open,
  departmentId,
  onClose,
}) => {
  const [details, setDetails] = useState<DepartmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MANAGER' | 'EMPLOYEE'>('ALL');

  useEffect(() => {
    if (open && departmentId) {
      loadDepartmentDetails(departmentId);
      setSearchQuery('');
      setRoleFilter('ALL');
    } else {
      setDetails(null);
      setError(null);
    }
  }, [open, departmentId]);

  const loadDepartmentDetails = async (id: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await departmentService.getDepartmentDetails(id);
      setDetails(data);
    } catch (err: any) {
      console.error('[DepartmentDetailsModal] Failed to fetch department details:', err);
      setError('Unable to load department details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees: DepartmentMember[] = (details?.employees || []).filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      emp.full_name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      (emp.job_title && emp.job_title.toLowerCase().includes(q)) ||
      (emp.phone && emp.phone.includes(q));

    const matchesRole =
      roleFilter === 'ALL'
        ? true
        : roleFilter === 'MANAGER'
        ? emp.role === 'DEPARTMENT_MANAGER'
        : emp.role !== 'DEPARTMENT_MANAGER';

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DEPARTMENT_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#526A55]/15 text-[#526A55] border border-[#526A55]/25">
            <UserCheck className="w-3 h-3" />
            Department Manager
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/25">
            Administrator
          </span>
        );
      case 'REGISTRY_OFFICER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-700 border border-sky-500/25">
            Registry Officer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#292A27]/10 text-[#292A27]">
            Employee
          </span>
        );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="3xl"
      closeOnOverlay={true}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-[#8A8983]">
            {details ? (
              <span>
                Total Workforce: <strong className="text-[#292A27]">{details.stats?.total_employees || 0}</strong> registered personnel
              </span>
            ) : null}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#526A55] animate-spin" />
          <p className="text-sm font-medium text-[#6B6A64]">Loading department details...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => departmentId && loadDepartmentDetails(departmentId)}>
            Try Again
          </Button>
        </div>
      ) : details ? (
        <div className="space-y-6 -mt-2">
          {/* ── Top Header Banner ── */}
          <div className="bg-gradient-to-br from-[#ECEAE3] to-[#F5F4EE] border border-[#D8D7D1] rounded-2xl p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#526A55] text-white tracking-wider shadow-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    {details.code}
                  </span>
                  <span className="text-xs font-semibold text-[#6B6A64] bg-[#D8D7D1]/50 px-2.5 py-0.5 rounded-md">
                    Directorate ID: #{details.id}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#292A27] tracking-tight">{details.name}</h3>
                <p className="text-xs text-[#6B6A64] leading-relaxed max-w-2xl">
                  {details.description || 'No official description registered for this directorate.'}
                </p>
              </div>

              <div className="bg-white/80 border border-[#D8D7D1] rounded-xl px-4 py-2.5 text-right flex-shrink-0 shadow-xs">
                <span className="block text-[11px] font-semibold text-[#8A8983] uppercase tracking-wider">
                  Total Staff
                </span>
                <span className="block text-2xl font-extrabold text-[#526A55]">
                  {details.stats?.total_employees || 0}
                </span>
              </div>
            </div>
          </div>

          {/* ── Key Metrics & Manager Highlight ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manager Card */}
            <div className="md:col-span-2 bg-[#F9F8F5] border border-[#D8D7D1] rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#292A27] uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-[#526A55]" />
                  <span>Assigned Directorate Manager</span>
                </div>
                {details.manager ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {details.manager.status}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3 h-3" />
                    Unassigned
                  </span>
                )}
              </div>

              {details.manager ? (
                <div className="flex items-start gap-3.5 bg-white border border-[#D8D7D1]/70 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-full bg-[#526A55] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    {details.manager.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#292A27] truncate">
                        {details.manager.full_name}
                      </h4>
                      <span className="text-[10px] font-medium text-[#6B6A64] bg-[#ECEAE3] px-2 py-0.5 rounded">
                        {details.manager.job_title || 'Directorate Lead'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B6A64]">
                      <a
                        href={`mailto:${details.manager.email}`}
                        className="inline-flex items-center gap-1 hover:text-[#526A55] hover:underline"
                      >
                        <Mail className="w-3 h-3" />
                        {details.manager.email}
                      </a>
                      {details.manager.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {details.manager.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>
                    No manager is currently designated for this department. Admin can assign one via Personnel Directory.
                  </span>
                </div>
              )}
            </div>

            {/* Workforce Breakdown Card */}
            <div className="bg-[#F9F8F5] border border-[#D8D7D1] rounded-xl p-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#292A27] uppercase tracking-wider">
                <Users className="w-4 h-4 text-[#526A55]" />
                <span>Personnel Breakdown</span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B6A64] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Active Members
                  </span>
                  <strong className="text-[#292A27] font-bold">
                    {details.stats?.active_employees || 0}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B6A64] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-400 inline-block" />
                    Inactive / Suspended
                  </span>
                  <strong className="text-[#292A27] font-bold">
                    {details.stats?.inactive_employees || 0}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#D8D7D1]/60">
                  <span className="text-[#6B6A64]">Operational Ratio</span>
                  <strong className="text-[#526A55] font-bold">
                    {details.stats?.total_employees
                      ? Math.round(((details.stats.active_employees || 0) / details.stats.total_employees) * 100)
                      : 0}
                    %
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── Employee Roster Section ── */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#292A27]">
                  Department Personnel & Staff Roster
                </h4>
                <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
                  {filteredEmployees.length} of {details.employees?.length || 0}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search input */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-[#8A8983] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff by name or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D8D7D1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#526A55] text-[#292A27] placeholder-[#8A8983]"
                  />
                </div>

                {/* Role filter buttons */}
                <div className="inline-flex rounded-lg border border-[#D8D7D1] bg-[#ECEAE3] p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRoleFilter('ALL')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors ${
                      roleFilter === 'ALL' ? 'bg-white text-[#292A27] shadow-xs' : 'text-[#6B6A64] hover:text-[#292A27]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('MANAGER')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors ${
                      roleFilter === 'MANAGER' ? 'bg-white text-[#292A27] shadow-xs' : 'text-[#6B6A64] hover:text-[#292A27]'
                    }`}
                  >
                    Managers
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('EMPLOYEE')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors ${
                      roleFilter === 'EMPLOYEE' ? 'bg-white text-[#292A27] shadow-xs' : 'text-[#6B6A64] hover:text-[#292A27]'
                    }`}
                  >
                    Employees
                  </button>
                </div>
              </div>
            </div>

            {/* Personnel List / Table */}
            {filteredEmployees.length === 0 ? (
              <div className="bg-[#F9F8F5] border border-dashed border-[#D8D7D1] rounded-xl py-10 text-center space-y-1.5">
                <Users className="w-8 h-8 text-[#8A8983] mx-auto opacity-70" />
                <p className="text-xs font-semibold text-[#292A27]">
                  {details.employees?.length === 0
                    ? 'No staff members currently assigned to this department.'
                    : 'No personnel matched your search query.'}
                </p>
                <p className="text-[11px] text-[#8A8983]">
                  {details.employees?.length === 0
                    ? 'Personnel assigned to this department from the Users tab will automatically appear here.'
                    : 'Try searching with a different name, email, or role filter.'}
                </p>
              </div>
            ) : (
              <div className="border border-[#D8D7D1] rounded-xl overflow-hidden bg-white shadow-xs max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#ECEAE3] text-[#292A27] font-bold text-[11px] sticky top-0 z-10 border-b border-[#D8D7D1]">
                    <tr>
                      <th className="py-2.5 px-3.5">Staff Member</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Job Title</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEAE3]">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#F9F8F5] transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#526A55]/15 text-[#526A55] font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                              {emp.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-[#292A27] block truncate">
                                {emp.full_name}
                              </span>
                              <span className="text-[10px] text-[#8A8983] block truncate">
                                ID: #{emp.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {getRoleBadge(emp.role)}
                        </td>

                        <td className="py-2.5 px-3 text-[#6B6A64] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-[#8A8983]" />
                            {emp.job_title || 'Officer'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-[#6B6A64]">
                          <div className="space-y-0.5">
                            <a
                              href={`mailto:${emp.email}`}
                              className="text-[11px] text-[#292A27] hover:text-[#526A55] hover:underline block truncate"
                            >
                              {emp.email}
                            </a>
                            {emp.phone ? (
                              <span className="text-[10px] text-[#8A8983] block">
                                {emp.phone}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {emp.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default DepartmentDetailsModal;
