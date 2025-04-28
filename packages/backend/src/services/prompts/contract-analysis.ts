export const SYSTEM_PROMPT = `You are an expert legal contract analyzer. Your task is to analyze legal contracts and provide structured assessments following specific guidelines and evaluation criteria.

Key Requirements:
- Maintain professional legal analysis standards
- Focus on practical implications and risks
- Provide clear, actionable insights
- Include confidence levels for assessments
- Highlight areas needing human review

Analysis Framework:
1. First-Pass Assessment
- Document type and purpose
- Overall structure and completeness
- Initial red flags or concerns

2. Detailed Analysis
- Identify all parties and their roles
- Key dates and deadlines
- Critical terms and conditions
- Financial obligations
- Governing law and jurisdiction

3. Critical Elements Review
- Essential clauses presence/absence
- Non-standard terms
- Ambiguous language
- Potential conflicts
- Missing safeguards

4. Risk Assessment Factors:
- Unclear or missing terms
- Unfavorable conditions
- Liability exposure
- Compliance issues
- Termination risks
- Performance obligations
- Dispute resolution mechanisms

Output Format Requirements:
Provide analysis in structured JSON format with:
{
  "overallRisk": "low" | "medium" | "high",
  "confidence": number, // 0-100
  "keyInformation": {
    "parties": string[],
    "startDate": string | null,
    "endDate": string | null,
    "value": string | null,
    "governingLaw": string | null,
    "criticalDates": { description: string, date: string }[]
  },
  "riskFlags": {
    "severity": "low" | "medium" | "high",
    "description": string,
    "clause": string,
    "recommendation": string
  }[]
}`;

export const createUserPrompt = (contractText: string): string => `Analyze the following contract text and provide a structured assessment following the framework above. Include specific quotes from the contract where relevant:

${contractText}`;

export const ANALYSIS_CONFIG = {
  model: 'gpt-4',
  temperature: 0.2,
  max_tokens: 2000,
  presence_penalty: 0,
  frequency_penalty: 0,
  stop: null
};

export interface ClauseType {
  name: string;
  required: boolean;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const STANDARD_CLAUSES: ClauseType[] = [
  {
    name: 'Parties',
    required: true,
    description: 'Clearly identifies all parties to the contract',
    riskLevel: 'high'
  },
  {
    name: 'Term',
    required: true,
    description: 'Specifies contract duration and termination conditions',
    riskLevel: 'high'
  },
  {
    name: 'Consideration',
    required: true,
    description: 'Details payment terms and obligations',
    riskLevel: 'high'
  },
  {
    name: 'Governing Law',
    required: true,
    description: 'Specifies jurisdiction and applicable laws',
    riskLevel: 'medium'
  },
  {
    name: 'Indemnification',
    required: false,
    description: 'Outlines liability and protection terms',
    riskLevel: 'medium'
  },
  {
    name: 'Force Majeure',
    required: false,
    description: 'Addresses unforeseeable circumstances',
    riskLevel: 'medium'
  },
  {
    name: 'Confidentiality',
    required: false,
    description: 'Protects sensitive information',
    riskLevel: 'medium'
  },
  {
    name: 'Assignment',
    required: false,
    description: 'Controls transfer of rights/obligations',
    riskLevel: 'medium'
  }
];

export const RISK_ASSESSMENT_CRITERIA = {
  high: {
    description: 'Critical issues requiring immediate attention',
    threshold: 0.8
  },
  medium: {
    description: 'Notable concerns needing review',
    threshold: 0.5
  },
  low: {
    description: 'Minor issues or standard terms',
    threshold: 0.2
  }
};
