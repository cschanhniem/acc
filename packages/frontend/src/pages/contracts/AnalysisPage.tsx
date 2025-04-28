import { useState } from "react";
import { ContractAnalysisResult, RiskFlag, Party } from "@aicontractcheck/shared";
import LegalDisclaimer from "../../components/common/LegalDisclaimer";

interface RiskBadgeProps {
  risk: "low" | "medium" | "high";
  className?: string;
}

function RiskBadge({ risk, className = "" }: RiskBadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const riskClasses = {
    low: "bg-success bg-opacity-10 text-success",
    medium: "bg-alert bg-opacity-10 text-alert",
    high: "bg-warning bg-opacity-10 text-warning animate-risk-pulse",
  };

  return (
    <span className={`${baseClasses} ${riskClasses[risk]} ${className}`}>
      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
    </span>
  );
}

interface RiskFlagCardProps {
  flag: RiskFlag;
}

function RiskFlagCard({ flag }: RiskFlagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card mb-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <RiskBadge risk={flag.severity} />
            <h4 className="text-h4 mb-0">
              {flag.type.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
            </h4>
          </div>
          <p className="text-slate mb-2">{flag.description}</p>
        </div>
      </div>
      
      {flag.clause && (
        <div className="mt-4">
          <button 
            className="text-small text-navy hover:text-opacity-80"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide" : "Show"} Related Clause
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-light-gray rounded text-small">
              <pre className="whitespace-pre-wrap font-mono text-slate">
                {flag.clause}
              </pre>
            </div>
          )}
        </div>
      )}

      {flag.recommendedAction && (
        <div className="mt-4 text-small">
          <strong className="text-navy">Recommended Action: </strong>
          <span className="text-slate">{flag.recommendedAction}</span>
        </div>
      )}
    </div>
  );
}

interface AnalysisPageProps {
  analysis: ContractAnalysisResult;
}

export function AnalysisPage({ analysis }: AnalysisPageProps) {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="mb-0">Contract Analysis Results</h1>
            <RiskBadge risk={analysis.overallRisk} className="text-base" />
          </div>
          {/* Removed analyzedAt display as it's not in ContractAnalysisResult type */}
          {/* <p className="text-slate mt-2">Analysis completed on {new Date(analysis.analyzedAt).toLocaleDateString()}</p> */}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Key Information */}
          <div className="card">
            <h2 className="text-h3">Key Information</h2>
            <div className="mt-4 space-y-4">
              {analysis.keyInformation.parties.length > 0 && (
                <div>
                  <h3 className="text-h4">Parties</h3>
                  <ul className="list-disc list-inside text-slate">
                    {analysis.keyInformation.parties.map((party: Party, index: number) => (
                      <li key={index}>
                        {party.name} ({party.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.keyInformation.startDate && (
                <div>
                  <h3 className="text-h4">Start Date</h3>
                  <p className="text-slate">{analysis.keyInformation.startDate}</p>
                </div>
              )}

              {analysis.keyInformation.endDate && (
                <div>
                  <h3 className="text-h4">End Date</h3>
                  <p className="text-slate">{analysis.keyInformation.endDate}</p>
                </div>
              )}

              {analysis.keyInformation.governingLaw && (
                <div>
                  <h3 className="text-h4">Governing Law</h3>
                  <p className="text-slate">{analysis.keyInformation.governingLaw}</p>
                </div>
              )}

              {/* Removed Jurisdiction as it's not in KeyInformation type */}
            </div>
          </div>

          {/* Analysis Stats */}
          <div className="card">
            <h2 className="text-h3">Analysis Overview</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-h4">Risk Flags</h3>
                <p className="text-slate">
                  {analysis.riskFlags.length} potential issues identified
                </p>
                <div className="mt-2 space-x-2">
                  {["high", "medium", "low"].map((severity: string) => {
                    const count = analysis.riskFlags.filter(
                      (flag: RiskFlag) => flag.severity === severity
                    ).length;
                    if (count > 0) {
                      return (
                        <RiskBadge
                          key={severity}
                          risk={severity as "low" | "medium" | "high"}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-h4">Confidence Score</h3>
                <p className="text-slate">{(analysis.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Flags */}
        <div className="mt-8">
          <h2 className="text-h2">Detailed Findings</h2>
          <div className="mt-4">
            {analysis.riskFlags.map((flag: RiskFlag, index: number) => (
              <RiskFlagCard key={index} flag={flag} />
            ))}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12">
          <LegalDisclaimer />
        </div>
      </div>
    </div>
  );
}
