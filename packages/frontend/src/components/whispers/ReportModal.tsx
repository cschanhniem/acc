import React, { useState } from 'react';
import { ReportReason } from '@peaceflow/shared';
import { useWhispersStore } from '../../stores/whispers';

interface ReportModalProps {
  whisperId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void; // Callback for successful submission
}

const validReasons: ReportReason[] = [
  "inappropriate",
  "spam",
  "harassment",
  "misinformation",
  "other",
];

const ReportModal: React.FC<ReportModalProps> = ({ whisperId, isOpen, onClose, onSubmitSuccess }) => {
  const { reportWhisper, loading, error: reportError, clearError } = useWhispersStore();
  const [reason, setReason] = useState<ReportReason>(validReasons[0]);
  const [details, setDetails] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperId) return;

    setFormError(null);
    clearError();

    try {
      await reportWhisper(whisperId, { reason, details });
      setDetails(''); // Clear details on success
      setReason(validReasons[0]); // Reset reason
      onSubmitSuccess(); // Call success callback (e.g., show notification)
      onClose(); // Close the modal
    } catch (err) {
      setFormError(reportError || "Failed to submit report.");
    }
  };

  const handleClose = () => {
    setFormError(null);
    clearError();
    setDetails('');
    setReason(validReasons[0]);
    onClose();
  };

  if (!isOpen || !whisperId) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Report Whisper</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason:
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {validReasons.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
              Details (Optional, max 500 chars):
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
             <p className="text-sm text-gray-500 mt-1">{details.length}/500</p>
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          {reportError && !formError && <p className="text-red-500 text-sm">Error: {reportError}</p>}


          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white font-semibold ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
