import React from 'react';
import { useParams } from 'react-router-dom';

export const DocumentPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[#F5F3ED] p-6">
      <div className="max-w-4xl mx-auto bg-[#ECEAE3] border border-[#292A27]/10 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-[#292A27]">Document Preview</h1>
        <p className="text-sm font-medium text-[#526A55] mt-1">Previewing Document ID: {id}</p>
        <p className="text-sm text-[#6B6A64] mt-2">
          PDF viewer preview implementation will be added in Phase 10.
        </p>
      </div>
    </div>
  );
};

export default DocumentPreview;
