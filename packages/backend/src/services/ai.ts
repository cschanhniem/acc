import OpenAI from 'openai';
import type { 
  ContractAnalysisResult,
  RiskFlag,
  Party,
  RiskLevel 
} from '@aicontractcheck/shared';
import { 
  SYSTEM_PROMPT, 
  createUserPrompt, 
  ANALYSIS_CONFIG,
  STANDARD_CLAUSES,
  RISK_ASSESSMENT_CRITERIA 
} from './prompts/contract-analysis';

export class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeContract(text: string): Promise<ContractAnalysisResult> {
    try {
      // Initial sanitization
      const sanitizedText = this.sanitizeText(text);

      // Get AI analysis
      const response = await this.openai.chat.completions.create({
        ...ANALYSIS_CONFIG,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: createUserPrompt(sanitizedText) }
        ]
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No analysis result received from AI');
      }

      // Parse and validate result
      const analysis = JSON.parse(result) as ContractAnalysisResult;
      
      // Enhance analysis with standard clause checks
      const missingClauses = this.checkMissingClauses(analysis);
      if (missingClauses.length > 0) {
        const missingFlags: RiskFlag[] = missingClauses.map(clause => ({
          type: 'missing_clause',
          severity: clause.riskLevel,
          description: `Missing ${clause.name} clause`,
          clause: clause.name,
          recommendedAction: `Add ${clause.name.toLowerCase()} clause: ${clause.description}`
        }));
        
        analysis.riskFlags.push(...missingFlags);
      }

      // Adjust overall risk based on missing critical clauses
      const criticalMissing = missingClauses.filter(c => c.required && c.riskLevel === 'high');
      if (criticalMissing.length > 0) {
        analysis.overallRisk = 'high';
        analysis.confidence = Math.min(analysis.confidence, 70); // Lower confidence when missing critical clauses
      }

      return this.validateAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      throw new Error('Failed to analyze contract');
    }
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/\r\n|\r|\n/g, '\n') // Normalize line endings
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private checkMissingClauses(analysis: ContractAnalysisResult): typeof STANDARD_CLAUSES[number][] {
    const foundClauses = new Set(
      analysis.riskFlags
        .filter(flag => flag.clause)
        .map(flag => flag.clause!.toLowerCase())
    );

    return STANDARD_CLAUSES.filter(clause => {
      const clauseName = clause.name.toLowerCase();
      return !foundClauses.has(clauseName) &&
        !analysis.keyInformation.parties.some(party => 
          party.name.toLowerCase().includes(clauseName)
        );
    });
  }

  private validateAnalysis(analysis: ContractAnalysisResult): ContractAnalysisResult {
    // Ensure all arrays exist
    analysis.riskFlags = analysis.riskFlags || [];
    analysis.keyInformation.criticalDates = analysis.keyInformation.criticalDates || [];
    analysis.keyInformation.parties = analysis.keyInformation.parties || [];

    // Validate risk level
    analysis.overallRisk = this.validateRiskLevel(
      analysis.overallRisk,
      analysis.confidence
    );

    // Ensure all risk flags have types
    analysis.riskFlags = analysis.riskFlags.map(flag => ({
      ...flag,
      type: flag.type || 'general_risk'
    }));

    return analysis;
  }

  private validateRiskLevel(
    severity: string,
    confidence: number
  ): RiskLevel {
    const threshold = RISK_ASSESSMENT_CRITERIA[severity as keyof typeof RISK_ASSESSMENT_CRITERIA]?.threshold;
    if (!threshold || confidence < threshold) {
      return 'high'; // Default to high risk if validation fails
    }
    return severity as RiskLevel;
  }
}
