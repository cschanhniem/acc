import { describe, it, expect } from 'vitest';
import { AIService } from '../../services/ai';
import { TEST_CONTRACTS, TEST_CLAUSES, TEST_SCENARIOS } from './test-contracts';
import type { ContractAnalysisResult, RiskFlag } from '@aicontractcheck/shared';

describe('AI Contract Analysis', () => {
  const ai = new AIService(process.env.OPENAI_API_KEY!);

  describe('Simple Contract Analysis', () => {
    it('should correctly analyze a simple service agreement', async () => {
      const result = await ai.analyzeContract(TEST_CONTRACTS.simple.content);
      const expected = TEST_CONTRACTS.simple.expectedResult;

      expect(result.overallRisk).toBe(expected.overallRisk);
      expect(result.keyInformation.parties).toEqual(expected.keyInformation.parties);
      expect(result.keyInformation.startDate).toBe(expected.keyInformation.startDate);
      expect(result.keyInformation.endDate).toBe(expected.keyInformation.endDate);
      expect(result.keyInformation.governingLaw).toBe(expected.keyInformation.governingLaw);
    });

    it('should identify all standard clauses', async () => {
      const result = await ai.analyzeContract(TEST_CONTRACTS.simple.content);
      const expectedClauses = TEST_CONTRACTS.simple.expectedResult.standardClauses;

      const foundClauses = result.riskFlags
        .filter(flag => flag.clause)
        .map(flag => flag.clause!.toLowerCase());

      expectedClauses.forEach(clause => {
        expect(foundClauses).toContain(clause);
      });
    });

    it('should calculate contract value correctly', async () => {
      const result = await ai.analyzeContract(TEST_CONTRACTS.simple.content);
      expect(result.keyInformation.value).toBe(TEST_CONTRACTS.simple.expectedResult.keyInformation.value);
    });
  });

  describe('Complex Contract Analysis', () => {
    it('should handle complex SaaS agreements', async () => {
      const result = await ai.analyzeContract(TEST_CONTRACTS.complex.content);
      const expected = TEST_CONTRACTS.complex.expectedResult;

      expect(result.overallRisk).toBe(expected.overallRisk);
      expect(result.keyInformation.value).toBe(expected.keyInformation.value);
      expect(result.keyInformation.parties).toEqual(expected.keyInformation.parties);
    });

    it('should identify critical dates including renewal deadlines', async () => {
      const result = await ai.analyzeContract(TEST_CONTRACTS.complex.content);
      const criticalDates = result.keyInformation.criticalDates;

      TEST_CONTRACTS.complex.expectedResult.keyInformation.criticalDates.forEach(expectedDate => {
        const found = criticalDates.some(date => 
          date.date === expectedDate.date && 
          date.description.toLowerCase().includes(expectedDate.description.toLowerCase())
        );
        expect(found).toBe(true);
      });
    });
  });

  describe('Clause Detection', () => {
    it('should detect standard clauses correctly', async () => {
      for (const clause of TEST_CLAUSES.standard) {
        const result = await ai.analyzeContract(clause.content);
        
        if (clause.expectation.detected) {
          expect(result.riskFlags.some(flag => 
            flag.clause?.toLowerCase().includes(clause.name.toLowerCase())
          )).toBe(true);
        }

        if (clause.name === 'Governing Law') {
          expect(result.keyInformation.governingLaw).toBe(clause.expectation.governingLaw);
        }
      }
    });

    it('should flag non-standard clauses appropriately', async () => {
      for (const clause of TEST_CLAUSES.nonStandard) {
        const result = await ai.analyzeContract(clause.content);
        
        const relevantFlag = result.riskFlags.find(flag => 
          flag.description.toLowerCase().includes(clause.content.toLowerCase())
        );

        expect(relevantFlag).toBeDefined();
        expect(relevantFlag!.severity).toBe(clause.expectation.riskLevel);
      }
    });
  });

  describe('Risk Assessment', () => {
    it('should identify missing required clauses', async () => {
      const result = await ai.analyzeContract(TEST_SCENARIOS.missingClauses.content);
      
      TEST_SCENARIOS.missingClauses.expectedFlags.forEach(flag => {
        const found = result.riskFlags.some(risk => 
          risk.type === 'missing_clause' && 
          risk.clause?.toLowerCase().includes(flag)
        );
        expect(found).toBe(true);
      });
    });

    it('should detect conflicting clauses', async () => {
      const result = await ai.analyzeContract(TEST_SCENARIOS.conflictingClauses.content);
      
      const hasConflictFlag = result.riskFlags.some(flag => 
        TEST_SCENARIOS.conflictingClauses.expectedFlags.includes(flag.type)
      );
      expect(hasConflictFlag).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty or invalid input gracefully', async () => {
      await expect(ai.analyzeContract('')).rejects.toThrow();
      await expect(ai.analyzeContract('   ')).rejects.toThrow();
    });

    it('should maintain consistent output structure even with partial content', async () => {
      const result = await ai.analyzeContract('Short incomplete contract text');
      
      expect(result).toHaveProperty('overallRisk');
      expect(result).toHaveProperty('keyInformation');
      expect(result).toHaveProperty('riskFlags');
      expect(Array.isArray(result.riskFlags)).toBe(true);
    });
  });
});
