import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LetterRelation } from '@/types/letter';
import Card from '@/components/common/Card';

interface RelatedLettersProps {
  relations?: LetterRelation[];
  currentLetterId: string;
}

export const RelatedLetters: React.FC<RelatedLettersProps> = ({ relations }) => {
  const navigate = useNavigate();

  if (!relations || relations.length === 0) {
    return null;
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#292A27]">Related Correspondence</h3>
        <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
          {relations.length} Linked
        </span>
      </div>

      <div className="space-y-3">
        {relations.map((rel) => {
          const isIncoming = rel.direction === 'INCOMING';

          return (
            <div
              key={rel.id}
              onClick={() => navigate(`/letters/${rel.id}`)}
              className="p-3.5 rounded-xl bg-[#ECEAE3] border border-[#D8D7D1] hover:border-[#526A55]/40 hover:bg-[#F5F3ED] transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] flex-shrink-0 ${
                    isIncoming
                      ? 'bg-[#526A55]/15 text-[#526A55]'
                      : 'bg-[#C48D3F]/15 text-[#8A5D19]'
                  }`}
                >
                  {isIncoming ? 'IN' : 'OUT'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#292A27] truncate block group-hover:text-[#526A55] transition-colors">
                    {rel.subject}
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] text-[#6B6A64] mt-0.5 font-mono">
                    <span>{rel.referenceNumber}</span>
                    <span>·</span>
                    <span className="capitalize font-sans text-[#8A8983]">
                      {rel.relationshipType.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <svg
                className="w-4 h-4 text-[#8A8983] group-hover:text-[#526A55] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RelatedLetters;
