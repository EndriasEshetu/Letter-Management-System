import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import letterService from "@/services/letterService";
import { LetterItem } from "@/types/letter";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import { RegisterLetterModal } from "@/components/letters";

const CreateResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState<LetterItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    letterService
      .getLetterById(id)
      .then(setIncoming)
      .catch((err: any) =>
        setError(err.message || "Unable to load the incoming letter."),
      );
  }, [id]);

  if (error)
    return (
      <ErrorState
        title="Response Unavailable"
        description={error}
        onRetry={() => window.location.reload()}
      />
    );
  if (!incoming) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading incoming letter..." />
      </div>
    );
  }

  return (
    <RegisterLetterModal
      open
      initialDirection="OUTGOING"
      initialRelatedLetterId={incoming.id}
      relatedIncomingReference={incoming.referenceNumber}
      relatedIncomingSubject={incoming.subject}
      onClose={() => navigate(`/letters/${incoming.id}`)}
      onSuccess={() => navigate("/letters?direction=OUTGOING")}
    />
  );
};

export default CreateResponse;
