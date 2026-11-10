const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(value: number, currency = "USD"): string {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(value);
}

const MONEY_COLUMN = /(total|spent|subtotal|tax|amount|price|cost)/i;

export function isMoneyColumn(column: string): boolean {
  return MONEY_COLUMN.test(column) && !/count/i.test(column);
}

export function formatCell(column: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return isMoneyColumn(column)
      ? formatCurrency(value)
      : value.toLocaleString("en-US");
  }
  return String(value);
}

export function humanize(column: string): string {
  return column.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
