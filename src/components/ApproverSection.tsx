import { useState } from "react";
import { updateTodo } from "../api/sharepoint";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

interface ApprovalSectionProps {
  requestId: string;
  currentStatus?: string;
  onApprovalChange?: () => void;
  setShowForm: (value: React.SetStateAction<boolean>) => void;
}

const ApprovalSection = ({
  requestId,
  currentStatus,
  onApprovalChange,
  setShowForm,
}: ApprovalSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleApproval = async (status: "Approved" | "Rejected") => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = await getAccessToken();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      await updateTodo(token, requestId, { approvalStatus: status });

      setSuccess(`Request ${status.toLowerCase()} successfully!`);

      // Call callback to refresh parent component if provided
      if (onApprovalChange) {
        setTimeout(() => onApprovalChange(), 1500);
        setShowForm(false);
        navigate("/", { replace: true });
        window.location.reload();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update approval status";
      setError(errorMessage);
      console.error("Approval error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if already approved or rejected
  const isAlreadyProcessed =
    currentStatus === "Approved" || currentStatus === "Rejected";

  if (isAlreadyProcessed) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentStatus === "Approved"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {currentStatus}
          </span>
          <span className="text-gray-400 text-sm">
            This request has already been processed
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">
        Approval Actions
      </h3>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">Error</p>
              <p className="text-sm text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-400 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-400">Success</p>
              <p className="text-sm text-green-300 mt-0.5">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Approve Button */}
        <button
          onClick={() => handleApproval("Approved")}
          disabled={loading}
          className="flex-1 px-5 py-2.5 rounded-lg cursor-pointer bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed border border-green-500 hover:border-green-400 disabled:border-gray-600 transition-all text-sm font-medium text-white disabled:text-gray-500 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Approve
            </span>
          )}
        </button>

        {/* Reject Button */}
        <button
          onClick={() => handleApproval("Rejected")}
          disabled={loading}
          className="flex-1 px-5 py-2.5 rounded-lg cursor-pointer bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed border border-red-500 hover:border-red-400 disabled:border-gray-600 transition-all text-sm font-medium text-white disabled:text-gray-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Reject
            </span>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        This action cannot be undone
      </p>
    </div>
  );
};

export default ApprovalSection;
