import { Hono } from 'hono';
import type { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { ContractAnalysisResult, ContractUpload } from '@aicontractcheck/shared';
import { AIService } from '../services/ai';
import { ContractModel } from '../models/contracts';

type AppBindings = { Bindings: Env };
const contracts = new Hono<AppBindings>();

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// List of allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
];

// Initialize models and services for each request
const initializeModels = (c: Context<AppBindings>) => ({
  contracts: new ContractModel(c.env.DB),
  ai: new AIService(c.env.OPENAI_API_KEY),
});

// Upload contract endpoint
contracts.post('/upload', async (c: Context<AppBindings>) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: 'File size exceeds 10MB limit' }, 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return c.json({ error: 'Invalid file type. Please upload a PDF or DOCX file' }, 400);
  }

  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const fileId = nanoid();
    const models = initializeModels(c);
    
    // Upload file to R2
    const fileKey = `contracts/${userId}/${fileId}/${file.name}`;
    await c.env.BUCKET.put(fileKey, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    // Create contract record
    const contractResult = await models.contracts.create({
      user_id: userId,
      file_name: file.name,
      file_type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx',
      file_size: file.size,
      file_key: fileKey,
      status: 'pending',
    });

    if (!contractResult.success || !contractResult.data) {
      throw new Error(contractResult.error || 'Failed to create contract record');
    }

    // Queue analysis job
    await c.env.ANALYSIS_QUEUE.send({
      contractId: contractResult.data.id,
      userId,
      fileKey,
    });

    return c.json({ contract: contractResult.data });
  } catch (error) {
    console.error('Error uploading contract:', error);
    return c.json({ error: 'Failed to upload contract' }, 500);
  }
});

// Analysis worker endpoint
contracts.post('/analyze', async (c: Context<AppBindings>) => {
  const { contractId, userId, fileKey } = await c.req.json();
  const models = initializeModels(c);

  try {
    // Update contract status
    const statusResult = await models.contracts.updateStatus(contractId, 'processing');
    if (!statusResult.success || !statusResult.data) {
      throw new Error('Failed to update contract status');
    }

    // Get file from R2
    const file = await c.env.BUCKET.get(fileKey);
    if (!file) {
      throw new Error('Contract file not found');
    }

    // Extract and analyze text
    const text = await file.text();
    const analysis = await models.ai.analyzeContract(text);

    // Save analysis results
    const savedAnalysis = await models.contracts.saveAnalysis(analysis);
    if (!savedAnalysis.success || !savedAnalysis.data) {
      throw new Error(savedAnalysis.error || 'Failed to save analysis');
    }

    return c.json({ analysis: savedAnalysis.data });
  } catch (error) {
    console.error('Error analyzing contract:', error);
    await models.contracts.updateStatus(contractId, 'failed');
    return c.json({ error: 'Failed to analyze contract' }, 500);
  }
});

// Get analysis results endpoint
contracts.get('/:id/analysis', async (c: Context<AppBindings>) => {
  const contractId = c.req.param('id');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  const models = initializeModels(c);

  try {
    // Get contract and verify ownership
    const contractResult = await models.contracts.findById(contractId);
    if (!contractResult.success || !contractResult.data || contractResult.data.user_id !== userId) {
      return c.json({ error: 'Contract not found' }, 404);
    }

    // Get analysis results
    const analysisResult = await models.contracts.getAnalysis(contractId);
    if (!analysisResult.success || !analysisResult.data) {
      return c.json({ error: 'Analysis not found' }, 404);
    }

    return c.json({ analysis: analysisResult.data });
  } catch (error) {
    console.error('Error getting analysis:', error);
    return c.json({ error: 'Failed to get analysis results' }, 500);
  }
});

// Get contract status endpoint
contracts.get('/:id/status', async (c: Context<AppBindings>) => {
  const contractId = c.req.param('id');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  const models = initializeModels(c);

  try {
    const contractResult = await models.contracts.findById(contractId);
    if (!contractResult.success || !contractResult.data || contractResult.data.user_id !== userId) {
      return c.json({ error: 'Contract not found' }, 404);
    }

    const contract = contractResult.data;
    return c.json({
      status: contract.status,
      progress: contract.status === 'completed' ? 100 : 
                contract.status === 'failed' ? 0 : 50,
    });
  } catch (error) {
    console.error('Error getting contract status:', error);
    return c.json({ error: 'Failed to get contract status' }, 500);
  }
});

export { contracts };
