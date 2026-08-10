import React from 'react';
import Card from '@/components/common/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  highlight?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  trend,
  trendType = 'neutral',
  highlight = false,
  icon,
  className = '',
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-[#4A6B4E] bg-[#4A6B4E]/10';
      case 'negative':
        return 'text-[#8B3232] bg-[#8B3232]/10';
      default:
        return 'text-[#6B6A64] bg-[#D8D7D1]/50';
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
        highlight
          ? 'border-[#C48D3F]/40 bg-[#C48D3F]/05 ring-1 ring-[#C48D3F]/20'
          : 'bg-[#ECEAE3]'
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6A64]">
            {title}
          </h4>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#292A27]">
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getTrendColor()}`}
              >
                {trend}
              </span>
            )}
          </div>
        </div>

        {icon ? (
          <div
            className={`p-3 rounded-2xl ${
              highlight
                ? 'bg-[#C48D3F]/15 text-[#8A5D19]'
                : 'bg-[#526A55]/10 text-[#526A55]'
            }`}
          >
            {icon}
          </div>
        ) : (
          highlight && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#C48D3F] animate-pulse" />
          )
        )}
      </div>

      {description && (
        <p className="mt-3 text-xs text-[#6B6A64] font-medium border-t border-[#D8D7D1]/50 pt-2">
          {description}
        </p>
      )}
    </Card>
  );
};

export default StatCard;
