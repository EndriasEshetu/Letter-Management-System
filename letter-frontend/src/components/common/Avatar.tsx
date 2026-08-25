import React from 'react';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type StatusIndicator = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  status?: StatusIndicator;
  className?: string;
  alt?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; statusDot: string }> = {
  sm: { container: 'w-7 h-7',  text: 'text-xs',  statusDot: 'w-2 h-2 border' },
  md: { container: 'w-9 h-9',  text: 'text-sm',  statusDot: 'w-2.5 h-2.5 border-[1.5px]' },
  lg: { container: 'w-12 h-12', text: 'text-base', statusDot: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-xl',  statusDot: 'w-3.5 h-3.5 border-2' },
};

const statusColors: Record<StatusIndicator, string> = {
  online:  'bg-[#4A6B4E]',
  offline: 'bg-[#B8B7AF]',
  busy:    'bg-[#8B3232]',
  away:    'bg-[#C48D3F]',
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getInitialsBg = (name: string): string => {
  const colors = [
    'bg-[#526A55] text-[#F5F3ED]',
    'bg-[#4A5A6B] text-[#F5F3ED]',
    'bg-[#6B5A4A] text-[#F5F3ED]',
    'bg-[#5A4A6B] text-[#F5F3ED]',
    'bg-[#4A6B5A] text-[#F5F3ED]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  status,
  className = '',
  alt,
}) => {
  const sizes = sizeMap[size];
  const initials = getInitials(name);
  const bg = getInitialsBg(name);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt ?? name ?? 'User avatar'}
          className={`${sizes.container} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes.container} ${bg} rounded-full flex items-center justify-center font-semibold ${sizes.text} select-none`}
          aria-label={alt ?? name ?? 'User avatar'}
          role="img"
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${sizes.statusDot} ${statusColors[status]} rounded-full border-[#F5F3ED]`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;
