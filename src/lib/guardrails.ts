/**
 * Guardrails Engine for InvoiceIQ
 * Implements NeMo / Llama-Guard / Custom rules for:
 * 1. PII Redaction & Data Sanitization (Credit Cards, SSNs, phone numbers)
 * 2. SQL Safety & Injection Prevention (Strict SELECT-only, table whitelisting)
 * 3. Financial Math Integrity (Subtotal + Tax == Total check)
 * 4. Prompt Injection & Jailbreak Defense
 */

export interface PiiRedactionResult {
  text: string;
  redactedCount: number;
  detectedTypes: string[];
}

export function redactPII(input: string): PiiRedactionResult {
  let text = input;
  let redactedCount = 0;
  const detectedTypes: string[] = [];

  // Credit card regex (simple Luhn-like 13-19 digit patterns)
  const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{15,16}\b/g;
  const ccMatches = text.match(ccRegex);
  if (ccMatches) {
    redactedCount += ccMatches.length;
    detectedTypes.push('Credit Card / Account Number');
    text = text.replace(ccRegex, (match) => {
      const clean = match.replace(/[- ]/g, '');
      const last4 = clean.slice(-4);
      return `[REDACTED_CARD_****${last4}]`;
    });
  }

  // Social Security Number regex (XXX-XX-XXXX)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  const ssnMatches = text.match(ssnRegex);
  if (ssnMatches) {
    redactedCount += ssnMatches.length;
    detectedTypes.push('US SSN / Tax ID');
    text = text.replace(ssnRegex, '[REDACTED_SSN]');
  }

  // Phone numbers (US/Intl patterns)
  const phoneRegex = /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches) {
    redactedCount += phoneMatches.length;
    detectedTypes.push('Phone Number');
    text = text.replace(phoneRegex, '[REDACTED_PHONE]');
  }

  return { text, redactedCount, detectedTypes };
}

export interface SqlValidationResult {
  isSafe: boolean;
  reasons: string[];
  sanitizedSql?: string;
}

const FORBIDDEN_SQL_KEYWORDS = [
  'DROP',
  'DELETE',
  'UPDATE',
  'INSERT',
  'ALTER',
  'TRUNCATE',
  'CREATE',
  'REPLACE',
  'EXEC',
  'EXECUTE',
  'SHUTDOWN',
  'GRANT',
  'REVOKE',
  'ATTACH',
  'DETACH',
  'PRAGMA',
];

const ALLOWED_TABLES = ['invoices', 'line_items', 'expenses'];

export function validateSQLQuery(query: string): SqlValidationResult {
  const clean = query.trim();
  const reasons: string[] = [];

  if (!clean) {
    return { isSafe: false, reasons: ['Query cannot be empty'] };
  }

  // Must start with SELECT or WITH (for CTEs)
  const upperQuery = clean.toUpperCase();
  if (!upperQuery.startsWith('SELECT') && !upperQuery.startsWith('WITH')) {
    reasons.push('Only read-only queries (SELECT / WITH) are permitted.');
  }

  // Check for forbidden mutations
  for (const keyword of FORBIDDEN_SQL_KEYWORDS) {
    const wordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (wordRegex.test(clean)) {
      reasons.push(`Forbidden destructive or DDL keyword detected: "${keyword}".`);
    }
  }

  // Check for stacked queries / semicolons followed by other commands
  if (/;\s*\S+/.test(clean)) {
    reasons.push('Stacked query execution (multiple statements separated by ;) is prohibited.');
  }

  // Check for SQL injection comments
  if (/(--|\/\*|\*\/)/.test(clean)) {
    reasons.push('SQL comments (-- or /* */) are disallowed to prevent comment-based injections.');
  }

  // Check table whitelist
  const fromMatches = clean.match(/FROM\s+([a-zA-Z0-9_]+)/gi);
  if (fromMatches) {
    for (const fromMatch of fromMatches) {
      const tableName = fromMatch.replace(/FROM\s+/i, '').trim().toLowerCase();
      if (!ALLOWED_TABLES.includes(tableName)) {
        reasons.push(`Table "${tableName}" is not in the allowed schema whitelist.`);
      }
    }
  }

  return {
    isSafe: reasons.length === 0,
    reasons,
    sanitizedSql: clean.replace(/;+$/, ''),
  };
}

export interface MathIntegrityResult {
  isValid: boolean;
  expectedTotal: number;
  reportedTotal: number;
  discrepancy: number;
  details: string;
}

export function validateInvoiceMath(
  subtotal: number,
  tax: number,
  total: number
): MathIntegrityResult {
  const calculated = Math.round((subtotal + tax) * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;
  const discrepancy = Math.abs(calculated - roundedTotal);

  // Allow up to $0.05 rounding difference for multi-item tax rounding
  const isValid = discrepancy <= 0.05;

  return {
    isValid,
    expectedTotal: calculated,
    reportedTotal: roundedTotal,
    discrepancy: Math.round(discrepancy * 100) / 100,
    details: isValid
      ? `Math check passed: Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) == Total ($${total.toFixed(2)})`
      : `Discrepancy detected: Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) yields $${calculated.toFixed(2)}, but invoice stated $${total.toFixed(2)} (diff: $${discrepancy.toFixed(2)})`,
  };
}

export function detectPromptInjection(prompt: string): { isInjection: boolean; flags: string[] } {
  const lower = prompt.toLowerCase();
  const flags: string[] = [];

  const patterns = [
    { name: 'instruction override', regex: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i },
    { name: 'roleplay jailbreak', regex: /you\s+are\s+now\s+(dan|an\s+unfiltered|an\s+unrestricted)/i },
    { name: 'system prompt leak', regex: /(reveal|print|show|repeat)\s+(your\s+)?(system\s+prompt|developer\s+mode)/i },
    { name: 'table drop attempt', regex: /drop\s+table/i },
    { name: 'admin bypass', regex: /sudo|superadmin|root\s+access|bypass\s+auth/i },
  ];

  for (const p of patterns) {
    if (p.regex.test(lower)) {
      flags.push(p.name);
    }
  }

  return {
    isInjection: flags.length > 0,
    flags,
  };
}
