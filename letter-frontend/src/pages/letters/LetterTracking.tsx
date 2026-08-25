import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import letterService from '@/services/letterService';
import { LetterItem } from '@/types/letter';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { LetterTimeline, LetterTrackingCard } from '@/components/letters';

export const LetterTracking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [searchRef, setSearchRef] = useState(initialRef);
  const [letter, setLetter] = useState<LetterItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchRef.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      // Search by reference number (mock: fetches all and finds match)
      const res = await letterService.getLetters({ search: searchRef.trim(), limit: 1 });
      if (res.data.length > 0) {
        const full = await letterService.getLetterById(res.data[0].id);
        setLetter(full);
      } else {
        setLetter(null);
      }
    } catch {
      setLetter(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchRef]);

  // Auto-search if ref came from URL
  useEffect(() => {
    if (initialRef) handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#292A27]">Letter Tracking</h1>
        <p className="text-xs md:text-sm text-[#6B6A64] mt-1">
          Track the current status and location of any letter using its reference number.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="bg-[#ECEAE3]">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-[#8A8983]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter reference number (e.g., IN/2026/00452 or OUT/2026/00891)"
              className="w-full pl-10 pr-4 py-3 text-sm bg-[#F5F3ED] border border-[#D8D7D1] rounded-xl text-[#292A27] placeholder-[#8A8983] focus:outline-none focus:ring-2 focus:ring-[#526A55]/40 focus:border-[#526A55]"
            />
          </div>
          <Button variant="primary" onClick={handleSearch} isLoading={isLoading}>
            Track Letter
          </Button>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" label="Searching letter records..." />
        </div>
      ) : hasSearched && !letter ? (
        <EmptyState
          title="Letter Not Found"
          description={`No letter matching reference "${searchRef}" was found in the system.`}
          actionLabel="Browse All Letters"
          onAction={() => navigate('/letters')}
        />
      ) : letter ? (
        <div className="space-y-6">
          {/* Tracking Summary */}
          <LetterTrackingCard
            referenceNumber={letter.referenceNumber}
            subject={letter.subject}
            status={letter.status}
            currentDepartment={letter.department_name}
            responsibleUser={letter.assignedEmployee || letter.created_by}
            dueDate={letter.dueDate}
            priority={letter.priority}
          />

          {/* Full Workflow Timeline */}
          <Card>
            <LetterTimeline
              currentStatus={letter.status}
              direction={letter.direction}
              timestamps={{
                created_at: letter.created_at,
                completed_at: letter.updated_at,
              }}
            />
          </Card>

          {/* Movement History */}
          {letter.movements && letter.movements.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-[#292A27] mb-4">Movement History</h2>
              <div className="relative">
                {letter.movements.map((movement, idx) => (
                  <div key={idx} className="flex items-start space-x-4 mb-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                        idx === 0 ? 'bg-[#526A55] ring-4 ring-[#526A55]/20' : 'bg-[#D8D7D1]'
                      }`} />
                      {idx < letter.movements!.length - 1 && (
                        <div className="w-0.5 flex-1 min-h-[30px] bg-[#D8D7D1]/60 mt-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-semibold text-[#292A27]">{movement.action}</p>
                      <p className="text-xs text-[#6B6A64]">
                        {movement.fromDepartment && `${movement.fromDepartment} → `}{movement.toDepartment}
                      </p>
                      <p className="text-[11px] text-[#8A8983] mt-0.5">
                        {movement.performedBy} · {movement.timestamp}
                      </p>
                      {movement.notes && (
                        <p className="text-xs text-[#6B6A64] mt-1 italic">"{movement.notes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* View Full Details */}
          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => navigate(`/letters/${letter.id}`)}>
              View Full Letter Details →
            </Button>
          </div>
        </div>
      ) : (
        /* Initial state — no search yet */
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#526A55]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#526A55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#292A27] mb-1">Track Any Official Letter</h3>
          <p className="text-sm text-[#6B6A64] max-w-md mx-auto">
            Enter the reference number of any incoming, outgoing, or internal letter to view its current status, location, and complete movement history.
          </p>
        </div>
      )}
    </div>
  );
};

export default LetterTracking;
