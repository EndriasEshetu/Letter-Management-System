import React from 'react';
import { Calendar, Download, RefreshCw, Filter } from 'lucide-react';
import { ReportFilters as IReportFilters, ReportDateRange, ReportExportFormat } from '@/types/report';
import { Department } from '@/types/department';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';

interface ReportFiltersProps {
  filters: IReportFilters;
  departments: Department[];
  isExporting: boolean;
  canChangeDepartment: boolean;
  onDateRangeChange: (range: ReportDateRange) => void;
  onDepartmentChange: (deptId: string) => void;
  onCustomDatesChange: (start: string, end: string) => void;
  onReset: () => void;
  onExport: (format: ReportExportFormat) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  departments,
  isExporting,
  canChangeDepartment,
  onDateRangeChange,
  onDepartmentChange,
  onCustomDatesChange,
  onReset,
  onExport,
}) => {
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...departments.map((d) => ({
      value: String(d.id),
      label: `${d.name} (${d.code})`,
    })),
  ];

  return (
    <div className="bg-[#ECEAE3] border border-[#292A27]/10 rounded-[1.5rem] p-4 md:p-6 mb-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left filter options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-grow">
          {/* Date Range Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6A64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#526A55]" /> Date Range
            </label>
            <Select
              options={dateRangeOptions}
              value={filters.dateRange}
              onChange={(val) => onDateRangeChange(val as ReportDateRange)}
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6A64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#526A55]" /> Department
            </label>
            <Select
              options={departmentOptions}
              value={filters.departmentId || 'all'}
              onChange={(val) => onDepartmentChange(val)}
              disabled={!canChangeDepartment}
            />
          </div>

          {/* Custom Date Inputs if custom range selected */}
          {filters.dateRange === 'custom' && (
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-[#6B6A64] uppercase mb-1">From</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => onCustomDatesChange(e.target.value, filters.endDate || '')}
                  className="w-full px-3 py-2 bg-[#F9F8F6] text-[#252622] border border-[#D8D7D1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#526A55]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-[#6B6A64] uppercase mb-1">To</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => onCustomDatesChange(filters.startDate || '', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] text-[#252622] border border-[#D8D7D1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#526A55]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#D8D7D1]/50">
          <Button variant="secondary" size="sm" onClick={onReset} className="h-10">
            <RefreshCw className="w-4 h-4 mr-1.5 text-[#6B6A64]" /> Reset
          </Button>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              isLoading={isExporting}
              onClick={() => onExport('csv')}
              className="h-10 bg-[#F5F3ED]"
            >
              <Download className="w-4 h-4 mr-1 text-[#526A55]" /> CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              isLoading={isExporting}
              onClick={() => onExport('pdf')}
              className="h-10"
            >
              <Download className="w-4 h-4 mr-1 text-white" /> PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
