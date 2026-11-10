import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Architecture" };

const STACK = [
  {
    title: "Backend",
    items: ["FastAPI", "Pydantic v2", "SQLAlchemy 2.0", "uv"],
    body: "Typed settings, dependency-injected database and chat model, camelCase API schemas, pytest + ruff.",
  },
  {
    title: "AI orchestration",
    items: ["LangChain", "LangGraph", "init_chat_model"],
    body: "Two compiled StateGraphs with conditional retry edges; provider-agnostic models with structured output.",
  },
  {
    title: "Frontend",
    items: ["Next.js App Router", "shadcn/ui", "Tailwind CSS v4", "Recharts"],
    body: "Server Components stream ledger data behind Suspense; client islands call FastAPI via a same-origin rewrite.",
  },
  {
    title: "Safety & evals",
    items: ["sqlglot", "Read-only DB session", "Eval CLI"],
    body: "AST SQL validation, PII redaction, injection screening, and threshold-gated eval suites.",
  },
];

const EXTRACTION_FLOW = [
  [
    "ingest",
    "Text and PDF text pass through; images go to the multimodal model for OCR.",
  ],
  [
    "guardrails",
    "Redact card numbers, SSNs and phones; reject prompt-injection attempts.",
  ],
  [
    "extract",
    "with_structured_output(InvoiceExtraction) returns a Pydantic-validated invoice.",
  ],
  [
    "validate",
    "Subtotal + tax = total and due-date checks. Failures loop back to extract with feedback.",
  ],
  ["persist", "Store as validated, or as needs_review once retries run out."],
];

const SQL_FLOW = [
  ["screen_question", "Block prompt-injection attempts before any LLM call."],
  [
    "generate_sql",
    "LLM writes a SqlPlan (SQL + chart type) from the live SQLAlchemy schema.",
  ],
  [
    "guard_sql",
    "sqlglot AST: one SELECT, allow-listed tables, no dangerous functions.",
  ],
  [
    "execute_sql",
    "Runs on a connection the database enforces as read-only; errors loop back for repair.",
  ],
];

const DECISIONS = [
  {
    q: "Why LangGraph instead of a single chain?",
    a: "Extraction is not linear. Validation failures need a cycle back to the LLM with concrete feedback, and the SQL agent must repair queries the guardrail or database rejects. Explicit nodes and conditional edges keep those loops bounded, testable and traceable.",
  },
  {
    q: "How is LLM-written SQL kept safe?",
    a: "Defense in depth. The question is screened, the SQL is parsed into an AST (not regex-matched) and checked for a single read-only statement over allow-listed tables, and execution happens in a transaction the database itself enforces as read-only.",
  },
  {
    q: "How does PII stay out of the model?",
    a: "The guardrails node redacts card numbers (keeping the last 4 digits), SSNs and phone numbers before the extract node builds its prompt. The stored source text is the redacted version.",
  },
  {
    q: "How is quality measured?",
    a: "`uv run python -m app.evals` exits non-zero when a metric misses its threshold. The deterministic guardrail suite gates CI; the extraction suite scores field accuracy against annotated invoices.",
  },
];

function Flow({ title, steps }: { title: string; steps: string[][] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l pl-6">
          {steps.map(([node, text], i) => (
            <li key={node}>
              <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full border bg-card font-mono text-xs">
                {i + 1}
              </span>
              <p className="font-mono text-sm font-semibold">{node}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        icon={BookOpen}
        title="Architecture"
        description="How the pieces fit together. The source of truth is the code in backend/ and frontend/."
      />
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <Card key={s.title} className="gap-3">
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {s.items.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Flow title="Extraction graph" steps={EXTRACTION_FLOW} />
          <Flow title="Text-to-SQL graph" steps={SQL_FLOW} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Design decisions</CardTitle>
            <CardDescription>
              Trade-offs worth explaining in a review or interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {DECISIONS.map((d) => (
              <div key={d.q} className="space-y-1">
                <h3 className="text-sm font-semibold">{d.q}</h3>
                <p className="text-sm text-muted-foreground">{d.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
