import {
  BookOpen,
  ChartColumn,
  Cpu,
  Database,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href:
    "/" | "/studio" | "/guardrails" | "/evals" | "/ledger" | "/architecture";
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Ask InvoiceIQ", icon: Sparkles },
  { href: "/studio", label: "Extraction Studio", icon: Cpu },
  { href: "/ledger", label: "Ledger", icon: Database },
  { href: "/guardrails", label: "Guardrails", icon: ShieldCheck },
  { href: "/evals", label: "Evals", icon: ChartColumn },
  { href: "/architecture", label: "Architecture", icon: BookOpen },
];
