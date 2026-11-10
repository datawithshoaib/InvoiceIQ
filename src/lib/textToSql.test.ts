import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSQLFromNaturalLanguage, executeSafeSQL } from './textToSql';
import { ExtractedInvoice } from './types';

const mockInvoices: ExtractedInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-101',
    vendorName: 'Zoom Video Communications',
    date: '2024-08-15',
    currency: 'USD',
    subtotal: 150.0,
    tax: 12.0,
    total: 162.0,
    category: 'Software & SaaS',
    paymentMethod: 'Amex ****9012',
    confidenceScore: 0.98,
    validationPassed: true,
    fileName: 'zoom-aug.pdf',
    lineItems: [],
    processingTimeMs: 420,
  },
  {
    id: '2',
    invoiceNumber: 'INV-102',
    vendorName: 'Figma Enterprise',
    date: '2024-09-01',
    currency: 'USD',
    subtotal: 450.0,
    tax: 36.0,
    total: 486.0,
    category: 'Software & SaaS',
    paymentMethod: 'Visa ****1122',
    confidenceScore: 0.99,
    validationPassed: true,
    fileName: 'figma-sept.pdf',
    lineItems: [],
    processingTimeMs: 450,
  },
  {
    id: '3',
    invoiceNumber: 'INV-103',
    vendorName: 'Amazon Web Services (AWS)',
    date: '2024-08-20',
    currency: 'USD',
    subtotal: 1200.0,
    tax: 96.0,
    total: 1296.0,
    category: 'Cloud Infrastructure',
    paymentMethod: 'Mastercard ****3456',
    confidenceScore: 0.97,
    validationPassed: true,
    fileName: 'aws-aug.pdf',
    lineItems: [],
    processingTimeMs: 510,
  },
];

test('generateSQLFromNaturalLanguage creates correct SQL for software spend last quarter', () => {
  const result = generateSQLFromNaturalLanguage('How much did I spend on software last quarter?');
  assert.equal(result.sql.includes('Software & SaaS'), true);
  assert.equal(result.sql.includes('SUM(total)'), true);
  assert.equal(result.chartType, 'metric');
});

test('executeSafeSQL returns accurate calculation for software spend', () => {
  const { sql } = generateSQLFromNaturalLanguage('How much did I spend on software last quarter?');
  const res = executeSafeSQL(sql, mockInvoices, 'How much did I spend on software last quarter?');

  assert.equal(res.isValid, true);
  assert.equal(res.guardrailPassed, true);
  assert.equal(res.rows.length, 1);
  // Zoom (162) + Figma (486) = 648
  assert.equal(res.rows[0].total_spent, 648.0);
  assert.equal(res.metricValue, '$648.00');
});

test('generateSQLFromNaturalLanguage produces category aggregation', () => {
  const result = generateSQLFromNaturalLanguage('Show spending breakdown by category');
  assert.equal(result.sql.includes('GROUP BY category'), true);
  assert.equal(result.chartType, 'pie');

  const res = executeSafeSQL(result.sql, mockInvoices);
  assert.equal(res.rows.length, 2); // Software & SaaS + Cloud Infrastructure
});
