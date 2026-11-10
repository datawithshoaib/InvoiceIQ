// Mirrors the FastAPI response models in backend/app/schemas/__init__.py.

export const EXPENSE_CATEGORIES = [
  "Software & SaaS",
  "Cloud Infrastructure",
  "Office & Facilities",
  "Meals & Entertainment",
  "Travel & Transport",
  "Hardware & Equipment",
  "Marketing & Ads",
  "Professional Services",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorAddress: string | null;
  date: string;
  dueDate: string | null;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  category: ExpenseCategory;
  paymentMethod: string | null;
  status: "validated" | "needs_review";
  validationWarnings: string[];
  detectedPii: string[];
  fileName: string;
  rawText: string | null;
  processingTimeMs: number;
  lineItems: LineItem[];
}

export interface PipelineStep {
  node: string;
  status: "completed" | "flagged" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export interface ExtractionResponse {
  status: "validated" | "needs_review" | "rejected";
  invoice: Invoice | null;
  steps: PipelineStep[];
  detectedPii: string[];
  validationErrors: string[];
  attempts: number;
}

export type ChartType = "bar" | "line" | "pie" | "metric" | "table";

export interface QueryResponse {
  question: string;
  status: "ok" | "blocked" | "error";
  sql: string | null;
  explanation: string;
  columns: string[];
  rows: Record<string, string | number | null>[];
  chartType: ChartType;
  metricLabel: string | null;
  metricValue: number | null;
  violations: string[];
  attempts: number;
  executionTimeMs: number;
}

export interface PiiResult {
  text: string;
  redactedCount: number;
  detectedTypes: string[];
}

export interface PromptInjectionResult {
  isInjection: boolean;
  flags: string[];
}

export interface SqlGuardResult {
  isSafe: boolean;
  violations: string[];
  normalizedSql: string | null;
}

export interface MathCheckResult {
  isValid: boolean;
  expectedTotal: number;
  reportedTotal: number;
  discrepancy: number;
  details: string;
}

export interface EvalMetric {
  name: string;
  score: number;
  threshold: number;
  passed: boolean;
  samples: number;
  description: string;
}

export interface EvalCaseResult {
  suite: string;
  case: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface EvalReport {
  suite: string;
  metrics: EvalMetric[];
  cases: EvalCaseResult[];
  durationMs: number;
}
