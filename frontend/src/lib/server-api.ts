import "server-only";

import type { Invoice } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function getInvoices(): Promise<Invoice[]> {
  const response = await fetch(`${API_URL}/api/v1/invoices`, {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`Failed to load invoices (${response.status})`);
  return response.json();
}
