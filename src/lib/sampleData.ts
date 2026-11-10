import { ExtractedInvoice } from './types';

export const SAMPLE_INVOICES: ExtractedInvoice[] = [
  {
    id: 'inv-aws-001',
    invoiceNumber: 'AWS-2024-88391',
    vendorName: 'Amazon Web Services, Inc.',
    vendorAddress: '410 Terry Avenue North, Seattle, WA 98109',
    date: '2024-08-14',
    dueDate: '2024-09-14',
    currency: 'USD',
    subtotal: 1248.5,
    tax: 102.38,
    total: 1350.88,
    category: 'Cloud Infrastructure',
    paymentMethod: 'Corporate Visa ****8492',
    confidenceScore: 0.99,
    validationPassed: true,
    fileName: 'aws_invoice_aug2024.pdf',
    processingTimeMs: 420,
    lineItems: [
      { id: 'li-1', description: 'Amazon Elastic Compute Cloud (EC2) - c6i.2xlarge', quantity: 720, unitPrice: 0.68, amount: 489.6 },
      { id: 'li-2', description: 'Amazon RDS for PostgreSQL - Multi-AZ db.r6g.xlarge', quantity: 720, unitPrice: 0.72, amount: 518.4 },
      { id: 'li-3', description: 'Amazon Simple Storage Service (S3) Standard Storage', quantity: 2400, unitPrice: 0.023, amount: 55.2 },
      { id: 'li-4', description: 'AWS Data Transfer Out to Internet', quantity: 2060, unitPrice: 0.09, amount: 185.3 },
    ],
    rawText: `AMAZON WEB SERVICES, INC.
INVOICE NUMBER: AWS-2024-88391
Invoice Date: August 14, 2024
Billing Period: July 1 - July 31, 2024
Bill To: Acme AI Technologies, Inc.

Summary:
Amazon EC2 Compute Hours: $489.60
Amazon RDS Multi-AZ Database: $518.40
Amazon S3 Storage: $55.20
AWS Data Transfer: $185.30
Subtotal: $1,248.50
Estimated Tax (8.2%): $102.38
TOTAL AMOUNT DUE: $1,350.88
Payment Method: Charged to Visa ending in 8492`,
  },
  {
    id: 'inv-figma-002',
    invoiceNumber: 'FIG-993821',
    vendorName: 'Figma, Inc.',
    vendorAddress: '760 Market St 10th Floor, San Francisco, CA 94102',
    date: '2024-08-01',
    dueDate: '2024-08-01',
    currency: 'USD',
    subtotal: 450.0,
    tax: 37.13,
    total: 487.13,
    category: 'Software & SaaS',
    paymentMethod: 'Corporate Amex ****9103',
    confidenceScore: 0.98,
    validationPassed: true,
    fileName: 'figma_enterprise_aug.pdf',
    processingTimeMs: 380,
    lineItems: [
      { id: 'li-5', description: 'Figma Enterprise Seat - Annual Subscription', quantity: 6, unitPrice: 75.0, amount: 450.0 },
    ],
    rawText: `FIGMA, INC. - TAX INVOICE
Invoice: FIG-993821
Date: August 1, 2024
Customer: Acme AI Technologies
Seats: 6 x Figma Enterprise @ $75/seat/mo
Subtotal: $450.00
State & City Tax (8.25%): $37.13
Total Paid: $487.13
Paid via AMEX ****9103`,
  },
  {
    id: 'inv-zoom-003',
    invoiceNumber: 'ZM-2024-4412',
    vendorName: 'Zoom Video Communications',
    vendorAddress: '55 Almaden Blvd, 6th Floor, San Jose, CA 95113',
    date: '2024-09-12',
    dueDate: '2024-09-12',
    currency: 'USD',
    subtotal: 180.0,
    tax: 15.3,
    total: 195.3,
    category: 'Software & SaaS',
    paymentMethod: 'Corporate Visa ****8492',
    confidenceScore: 0.99,
    validationPassed: true,
    fileName: 'zoom_pro_plan.pdf',
    processingTimeMs: 350,
    lineItems: [
      { id: 'li-6', description: 'Zoom Business Plan (10 hosts)', quantity: 10, unitPrice: 15.0, amount: 150.0 },
      { id: 'li-7', description: 'Zoom Large Meeting Add-on 500', quantity: 1, unitPrice: 30.0, amount: 30.0 },
    ],
    rawText: `ZOOM VIDEO COMMUNICATIONS, INC.
Invoice ID: ZM-2024-4412
Date: September 12, 2024
Plan: Zoom Business (10 Licenses): $150.00
Add-on: Large Meeting 500: $30.00
Subtotal: $180.00
Taxes & Fees: $15.30
Total: $195.30`,
  },
  {
    id: 'inv-datadog-004',
    invoiceNumber: 'DD-881203',
    vendorName: 'Datadog, Inc.',
    vendorAddress: '620 8th Avenue, 45th Floor, New York, NY 10018',
    date: '2024-08-25',
    dueDate: '2024-09-25',
    currency: 'USD',
    subtotal: 780.0,
    tax: 64.35,
    total: 844.35,
    category: 'Software & SaaS',
    paymentMethod: 'Mastercard ****4019',
    confidenceScore: 0.97,
    validationPassed: true,
    fileName: 'datadog_apm_logs.pdf',
    processingTimeMs: 460,
    lineItems: [
      { id: 'li-8', description: 'Datadog Pro Infrastructure Hosts (15 hosts)', quantity: 15, unitPrice: 15.0, amount: 225.0 },
      { id: 'li-9', description: 'APM & Continuous Profiler (15 hosts)', quantity: 15, unitPrice: 31.0, amount: 465.0 },
      { id: 'li-10', description: 'Log Management Ingestion (300 GB)', quantity: 300, unitPrice: 0.3, amount: 90.0 },
    ],
    rawText: `DATADOG INVOICE DD-881203
Billing Date: Aug 25, 2024
Infrastructure Monitoring: $225.00
APM & Profiler: $465.00
Log Management: $90.00
Net Subtotal: $780.00
Sales Tax: $64.35
Total Invoiced: $844.35`,
  },
  {
    id: 'inv-starbucks-005',
    invoiceNumber: 'SBUX-91823',
    vendorName: 'Starbucks Coffee Co.',
    vendorAddress: 'Market St & 4th, San Francisco, CA',
    date: '2024-09-18',
    currency: 'USD',
    subtotal: 42.5,
    tax: 3.61,
    total: 46.11,
    category: 'Meals & Entertainment',
    paymentMethod: 'Apple Pay (Visa ****8492)',
    confidenceScore: 0.96,
    validationPassed: true,
    fileName: 'starbucks_team_coffee.png',
    processingTimeMs: 290,
    lineItems: [
      { id: 'li-11', description: 'Iced Caramel Macchiato (Venti)', quantity: 3, unitPrice: 6.25, amount: 18.75 },
      { id: 'li-12', description: 'Nitro Cold Brew with Sweet Cream', quantity: 2, unitPrice: 5.75, amount: 11.5 },
      { id: 'li-13', description: 'Ham & Swiss Croissant', quantity: 2, unitPrice: 6.125, amount: 12.25 },
    ],
    rawText: `STARBUCKS STORE #10492
Date: 09/18/2024 09:32 AM
Receipt # SBUX-91823
3x Iced Caramel Macchiato: $18.75
2x Nitro Cold Brew: $11.50
2x Croissants: $12.25
Subtotal: $42.50
Tax: $3.61
Total: $46.11
Card: Apple Pay VISA 8492`,
  },
  {
    id: 'inv-uber-006',
    invoiceNumber: 'UBR-TRIP-7731',
    vendorName: 'Uber Technologies, Inc.',
    vendorAddress: '1515 3rd St, San Francisco, CA 94158',
    date: '2024-09-22',
    currency: 'USD',
    subtotal: 68.4,
    tax: 5.81,
    total: 74.21,
    category: 'Travel & Transport',
    paymentMethod: 'Corporate Amex ****9103',
    confidenceScore: 0.99,
    validationPassed: true,
    fileName: 'uber_trip_sfo.pdf',
    processingTimeMs: 310,
    lineItems: [
      { id: 'li-14', description: 'UberX Trip from SFO Airport to Downtown Hotel', quantity: 1, unitPrice: 58.4, amount: 58.4 },
      { id: 'li-15', description: 'Driver Tip', quantity: 1, unitPrice: 10.0, amount: 10.0 },
    ],
    rawText: `UBER TRIP RECEIPT
Trip ID: UBR-TRIP-7731
Date: Sep 22, 2024
Pickup: San Francisco International Airport
Dropoff: Marriott Marquis, SF
Trip Fare: $58.40
Tip: $10.00
Taxes & City Surcharge: $5.81
Total Charged: $74.21`,
  },
  {
    id: 'inv-github-007',
    invoiceNumber: 'GH-2024-00918',
    vendorName: 'GitHub, Inc.',
    vendorAddress: '88 Colin P Kelly Jr St, San Francisco, CA 94107',
    date: '2024-07-15',
    dueDate: '2024-07-15',
    currency: 'USD',
    subtotal: 380.0,
    tax: 31.35,
    total: 411.35,
    category: 'Software & SaaS',
    paymentMethod: 'Corporate Visa ****8492',
    confidenceScore: 0.99,
    validationPassed: true,
    fileName: 'github_copilot_enterprise.pdf',
    processingTimeMs: 370,
    lineItems: [
      { id: 'li-16', description: 'GitHub Enterprise Cloud (10 seats)', quantity: 10, unitPrice: 21.0, amount: 210.0 },
      { id: 'li-17', description: 'GitHub Copilot Business (10 seats)', quantity: 10, unitPrice: 19.0, amount: 190.0 },
    ],
    rawText: `GITHUB, INC.
INVOICE # GH-2024-00918
Date: July 15, 2024
Customer: Acme AI Technologies
GitHub Enterprise Cloud (10 seats): $210.00
GitHub Copilot Business (10 seats): $190.00
Subtotal: $400.00 (with $20 discount = $380.00)
Tax: $31.35
Total: $411.35`,
  },
  {
    id: 'inv-wework-008',
    invoiceNumber: 'WW-2024-8841',
    vendorName: 'WeWork Companies LLC',
    vendorAddress: '575 5th Ave, New York, NY 10017',
    date: '2024-08-05',
    dueDate: '2024-08-05',
    currency: 'USD',
    subtotal: 1850.0,
    tax: 164.19,
    total: 2014.19,
    category: 'Office & Facilities',
    paymentMethod: 'ACH Transfer ****5519',
    confidenceScore: 0.98,
    validationPassed: true,
    fileName: 'wework_private_office.pdf',
    processingTimeMs: 490,
    lineItems: [
      { id: 'li-18', description: 'Dedicated Private Office (6 desks) - SF Financial District', quantity: 1, unitPrice: 1850.0, amount: 1850.0 },
    ],
    rawText: `WEWORK COMPANIES LLC
Invoice: WW-2024-8841
Billing Month: August 2024
Location: 600 California St, San Francisco, CA
Dedicated Office - 6 Desks: $1,850.00
Local Facilities Tax & Surcharge: $164.19
Total: $2,014.19
Payment Method: Auto-Debit Bank Account ****5519`,
  },
  {
    id: 'inv-apple-009',
    invoiceNumber: 'APL-R-99214',
    vendorName: 'Apple Store Inc.',
    vendorAddress: '1 Apple Park Way, Cupertino, CA 95014',
    date: '2024-09-05',
    currency: 'USD',
    subtotal: 2499.0,
    tax: 218.66,
    total: 2717.66,
    category: 'Hardware & Equipment',
    paymentMethod: 'Corporate Visa ****8492',
    confidenceScore: 0.99,
    validationPassed: true,
    fileName: 'apple_macbook_pro.pdf',
    processingTimeMs: 520,
    lineItems: [
      { id: 'li-19', description: '16-inch MacBook Pro M3 Max (36GB Unified Memory, 1TB SSD)', quantity: 1, unitPrice: 2499.0, amount: 2499.0 },
    ],
    rawText: `APPLE STORE - RETAIL RECEIPT
Receipt Number: APL-R-99214
Order Date: September 5, 2024
Item: 16-inch MacBook Pro - Space Black
Specs: Apple M3 Max chip with 14-core CPU, 30-core GPU, 36GB RAM, 1TB SSD
Unit Price: $2,499.00
Sales Tax (8.75%): $218.66
Total Tendered: $2,717.66`,
  },
];
