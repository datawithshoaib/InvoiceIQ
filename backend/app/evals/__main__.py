"""CLI: `uv run python -m app.evals [guardrails|extraction] [--limit N]`.

Exits non-zero when any metric misses its threshold, so it can gate CI.
"""

import argparse
import sys

from app.core.llm import get_chat_model
from app.evals.suites import run_extraction_suite, run_guardrail_suite


def main() -> int:
    parser = argparse.ArgumentParser(description="Run InvoiceIQ evaluation suites.")
    parser.add_argument("suite", choices=["guardrails", "extraction"], default="guardrails", nargs="?")
    parser.add_argument("--limit", type=int, default=None, help="Max documents for the extraction suite")
    args = parser.parse_args()

    report = (
        run_guardrail_suite()
        if args.suite == "guardrails"
        else run_extraction_suite(get_chat_model(), limit=args.limit)
    )

    for case in report.cases:
        if not case.passed:
            print(f"  FAIL [{case.suite}] {case.case}: expected {case.expected!r}, got {case.actual!r}")
    for metric in report.metrics:
        mark = "PASS" if metric.passed else "FAIL"
        print(f"{mark}  {metric.name:<40} {metric.score:7.1%}  (threshold {metric.threshold:.0%}, n={metric.samples})")
    print(f"Completed in {report.duration_ms:.0f} ms")
    return 0 if all(m.passed for m in report.metrics) else 1


if __name__ == "__main__":
    sys.exit(main())
