import { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';
import { Contract, ContractAnalysisDB, QueryResult, QueryArrayResult } from './types';
import { ContractAnalysisResult } from '@aicontractcheck/shared';

export class ContractModel {
  constructor(private db: D1Database) {}

  async create(contract: Omit<Contract, 'id' | 'uploaded_at' | 'analyzed_at'>): QueryResult<Contract> {
    const id = nanoid();
    try {
      await this.db.prepare(`
        INSERT INTO contracts (
          id, user_id, file_name, file_type, file_size, file_key, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        contract.user_id,
        contract.file_name,
        contract.file_type,
        contract.file_size,
        contract.file_key,
        contract.status
      ).run();

      const result = await this.findById(id);
      return result;
    } catch (error) {
      console.error('Error creating contract:', error);
      return { success: false, error: 'Failed to create contract' };
    }
  }

  async findById(id: string): QueryResult<Contract> {
    try {
      const result = await this.db.prepare(
        'SELECT * FROM contracts WHERE id = ?'
      ).bind(id).first<Contract>();

      if (!result) {
        return { success: false, error: 'Contract not found' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error finding contract:', error);
      return { success: false, error: 'Failed to find contract' };
    }
  }

  async findByUserId(userId: string): QueryArrayResult<Contract> {
    try {
      const results = await this.db.prepare(
        'SELECT * FROM contracts WHERE user_id = ? ORDER BY uploaded_at DESC'
      ).bind(userId).all<Contract>();

      return { success: true, data: results.results };
    } catch (error) {
      console.error('Error finding contracts:', error);
      return { success: false, error: 'Failed to find contracts' };
    }
  }

  async updateStatus(id: string, status: Contract['status']): QueryResult<Contract> {
    try {
      await this.db.prepare(
        'UPDATE contracts SET status = ? WHERE id = ?'
      ).bind(status, id).run();

      return this.findById(id);
    } catch (error) {
      console.error('Error updating contract status:', error);
      return { success: false, error: 'Failed to update contract status' };
    }
  }

  async saveAnalysis(analysis: ContractAnalysisResult): QueryResult<ContractAnalysisDB> {
    const id = nanoid();
    try {
      await this.db.prepare(`
        INSERT INTO contract_analysis (
          id, contract_id, overall_risk, confidence, key_information, risk_flags
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        analysis.contractId,
        analysis.overallRisk,
        analysis.confidence,
        JSON.stringify(analysis.keyInformation),
        JSON.stringify(analysis.riskFlags)
      ).run();

      // Update contract status
      await this.updateStatus(analysis.contractId, 'completed');

      const result = await this.db.prepare(
        'SELECT * FROM contract_analysis WHERE id = ?'
      ).bind(id).first<ContractAnalysisDB>();

      if (!result) {
        return { success: false, error: 'Analysis not found after creation' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error saving analysis:', error);
      return { success: false, error: 'Failed to save analysis' };
    }
  }

  async getAnalysis(contractId: string): QueryResult<ContractAnalysisResult> {
    try {
      const result = await this.db.prepare(
        'SELECT * FROM contract_analysis WHERE contract_id = ?'
      ).bind(contractId).first<ContractAnalysisDB>();

      if (!result) {
        return { success: false, error: 'Analysis not found' };
      }

      // Convert stored JSON strings back to objects
      const analysis: ContractAnalysisResult = {
        id: result.id,
        contractId: result.contract_id,
        overallRisk: result.overall_risk,
        confidence: result.confidence,
        keyInformation: JSON.parse(result.key_information),
        riskFlags: JSON.parse(result.risk_flags),
        analyzedAt: result.created_at,
      };

      return { success: true, data: analysis };
    } catch (error) {
      console.error('Error getting analysis:', error);
      return { success: false, error: 'Failed to get analysis' };
    }
  }
}
