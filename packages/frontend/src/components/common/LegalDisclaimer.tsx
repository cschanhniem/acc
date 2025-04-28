import React from "react";

interface LegalDisclaimerProps {
  className?: string;
}

const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ className = "" }) => {
  return (
    <div className={`p-4 bg-gray-100 border border-gray-300 rounded-md text-xs text-gray-600 ${className}`}>
      <h4 className="font-semibold text-sm text-gray-700 mb-2">Important Disclaimer</h4>
      <p>
        AI Contract Check provides informational insights based on automated analysis and common patterns.
        It is **not** a substitute for professional legal advice from a qualified attorney.
      </p>
      <p className="mt-1">
        Use of this service does not create an attorney-client relationship. While we strive for accuracy,
        the analysis is not guaranteed to be complete, error-free, or applicable to your specific situation.
        Contract language can be complex and context-dependent.
      </p>
      <p className="mt-1">
        **Always consult with a qualified legal professional** regarding important contracts or legal matters
        before making any decisions or signing any documents. Relying solely on this tool is done at your own risk.
      </p>
    </div>
  );
};

export default LegalDisclaimer;
