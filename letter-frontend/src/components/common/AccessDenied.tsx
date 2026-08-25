import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import { ShieldAlert } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  role?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Access Restricted',
  description = 'You do not have permission to view or manage this section of the Smart E-Office platform.',
  role,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center space-y-5 bg-[#F5F3ED] border border-[#D8D7D1] shadow-xs">
        <div className="w-16 h-16 bg-[#8B3232]/10 text-[#8B3232] rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#292A27]">{title}</h2>
          <p className="text-sm text-[#6B6A64] leading-relaxed">
            {description}
          </p>
          {role && (
            <p className="text-xs text-[#8A8983] pt-1">
              Current Role: <strong className="text-[#292A27] font-semibold">{role}</strong>
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="primary"
            fullWidth
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AccessDenied;
