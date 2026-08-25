import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  roleBadge?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  roleBadge,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-[#D8D7D1]/60">
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#292A27]">
            {title}
          </h1>
          {roleBadge && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#526A55]/10 text-[#526A55] border border-[#526A55]/20">
              {roleBadge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs md:text-sm text-[#6B6A64] mt-1 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="text-xs text-[#8A8983] font-medium self-start md:self-auto bg-[#ECEAE3] px-3 py-1.5 rounded-xl border border-[#D8D7D1]/60">
        Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
};

export default DashboardHeader;
