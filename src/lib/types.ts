export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category?: string;
}

export type ExpenseCategory =
  | 'Software & SaaS'
  | 'Cloud Infrastructure'
  | 'Office & Facilities'
  | 'Meals & Entertainment'
  | 'Travel & Transport'
  | 'Hardware & Equipment'
  | 'Marketing & Ads'
  | 'Professional Services'
  | 'Other';

export interface ExtractedInvoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorAddress?: string;
  date: string; // YYYY-MM-DD
  dueDate?: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  category: ExpenseCategory;
  paymentMethod: string;
  confidenceScore: number; // 0.0 - 1.0
  validationPassed: boolean;
  validationWarnings?: string[];
  rawText?: string;
  fileUrl?: string;
  fileName: string;
  lineItems: LineItem[];
  detectedPii?: string[];
  processingTimeMs: number;
}

export interface SQLQueryResult {
  query: string;
  naturalQuery: string;
  isValid: boolean;
  guardrailPassed: boolean;
  guardrailReason?: string;
  explanation: string;
  columns: string[];
  rows: Record<string, any>[];
  chartType?: 'bar' | 'line' | 'pie' | 'metric';
  metricValue?: string | number;
  metricLabel?: string;
  executionTimeMs: number;
}

export interface GuardrailCheckResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: string;
  }[];
  sanitizedText?: string;
  redactedCount: number;
}

export interface EvalMetric {
  name: string;
  score: number; // 0 - 100
  target: number;
  unit: string;
  status: 'passing' | 'warning' | 'failing';
  description: string;
}

export interface GroundTruthInvoice {
  fileName: string;
  groundTruth: ExtractedInvoice;
  systemPrediction: ExtractedInvoice;
  fieldScores: Record<string, number>; // vendor: 1.0, total: 1.0, etc.
}

export interface LangGraphStep {
  id: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputStateSummary: string;
  outputStateSummary: string;
  durationMs: number;
  details?: Record<string, any>;
}
