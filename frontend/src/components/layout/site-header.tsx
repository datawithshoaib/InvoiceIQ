import Link from "next/link";
import { Receipt } from "lucide-react";

import { MainNav } from "@/components/layout/main-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Receipt className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">
              InvoiceIQ
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              LangGraph invoice extraction &amp; Text-to-SQL financial agent
            </span>
          </span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
