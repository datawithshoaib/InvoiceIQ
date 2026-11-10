"""Deterministic guardrails shared by the agents and the API.

1. PII redaction (card numbers, SSN / tax IDs, phone numbers) before any text
   reaches an LLM.
2. Prompt-injection / jailbreak heuristics on user and document text.
3. SQL safety: AST validation with sqlglot (single read-only statement,
   allow-listed tables, no dangerous functions).
4. Financial math integrity (subtotal + tax == total).
"""

import re
from collections.abc import Iterable

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError

from app.schemas import MathCheckResult, PiiResult, PromptInjectionResult, SqlGuardResult

# --- PII ----------------------------------------------------------------------

_CARD = re.compile(r"\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{15,16}\b")
_SSN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_PHONE = re.compile(r"(?<!\w)(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b")


def _mask_card(match: re.Match[str]) -> str:
    digits = re.sub(r"\D", "", match.group(0))
    return f"[REDACTED_CARD_****{digits[-4:]}]"


def redact_pii(text: str) -> PiiResult:
    redacted_count = 0
    detected: list[str] = []
    rules = (
        ("Credit Card Number", _CARD, _mask_card),
        ("US SSN / Tax ID", _SSN, "[REDACTED_SSN]"),
        ("Phone Number", _PHONE, "[REDACTED_PHONE]"),
    )
    for label, pattern, replacement in rules:
        text, count = pattern.subn(replacement, text)
        if count:
            redacted_count += count
            detected.append(label)
    return PiiResult(text=text, redacted_count=redacted_count, detected_types=detected)


# --- Prompt injection ---------------------------------------------------------

_INJECTION_RULES: tuple[tuple[str, re.Pattern[str]], ...] = (
    (
        "instruction override",
        re.compile(r"\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+instructions"),
    ),
    ("roleplay jailbreak", re.compile(r"\byou\s+are\s+now\s+(dan|an?\s+unfiltered|an?\s+unrestricted|jailbroken)")),
    (
        "system prompt leak",
        re.compile(
            r"\b(reveal|print|show|repeat)\s+(me\s+)?(your\s+|the\s+)?(system\s+prompt|developer\s+mode|hidden\s+instructions)"
        ),
    ),
    ("destructive sql request", re.compile(r"\b(drop|truncate)\s+table\b|\bdelete\s+from\b")),
    ("privilege escalation", re.compile(r"\b(sudo|superadmin|root\s+access|bypass\s+(auth|safety|guardrails))\b")),
)


def detect_prompt_injection(text: str) -> PromptInjectionResult:
    lowered = text.lower()
    flags = [name for name, pattern in _INJECTION_RULES if pattern.search(lowered)]
    return PromptInjectionResult(is_injection=bool(flags), flags=flags)


# --- SQL ----------------------------------------------------------------------

_FORBIDDEN_NODES: tuple[type[exp.Expression], ...] = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Create,
    exp.Alter,
    exp.Command,
    exp.Merge,
    exp.TruncateTable,
)
_FORBIDDEN_FUNCTIONS = frozenset({"load_extension", "readfile", "writefile", "pg_read_file", "pg_sleep", "sleep"})


def validate_sql(sql: str, allowed_tables: Iterable[str], dialect: str = "sqlite") -> SqlGuardResult:
    allowed = {t.lower() for t in allowed_tables}
    if not sql.strip():
        return SqlGuardResult(is_safe=False, violations=["Query is empty."])

    try:
        statements = [s for s in sqlglot.parse(sql, read=dialect) if s is not None]
    except ParseError as exc:
        return SqlGuardResult(
            is_safe=False,
            violations=[f"SQL could not be parsed: {exc.errors[0]['description'] if exc.errors else exc}"],
        )

    if len(statements) != 1:
        return SqlGuardResult(
            is_safe=False, violations=["Exactly one statement is allowed (stacked queries are prohibited)."]
        )

    stmt = statements[0]
    violations: list[str] = []

    if not isinstance(stmt, exp.Query):
        violations.append(f"Only read-only SELECT queries are permitted (got {stmt.key.upper()}).")

    for node in stmt.walk():
        if isinstance(node, _FORBIDDEN_NODES):
            violations.append(f"Forbidden operation: {node.key.upper()}.")
        elif isinstance(node, exp.Func):
            name = (node.name if isinstance(node, exp.Anonymous) else node.sql_name()).lower()
            if name in _FORBIDDEN_FUNCTIONS:
                violations.append(f"Forbidden function: {name}().")

    cte_names = {cte.alias_or_name.lower() for cte in stmt.find_all(exp.CTE)}
    for table in stmt.find_all(exp.Table):
        name = table.name.lower()
        if not name or name in cte_names:
            continue
        if name not in allowed:
            violations.append(f"Table '{name}' is not allow-listed. Allowed: {sorted(allowed)}.")

    return SqlGuardResult(
        is_safe=not violations,
        violations=list(dict.fromkeys(violations)),
        normalized_sql=stmt.sql(dialect=dialect) if not violations else None,
    )


# --- Financial math -----------------------------------------------------------

MATH_TOLERANCE = 0.05


def check_invoice_math(subtotal: float, tax: float, total: float) -> MathCheckResult:
    expected = round(subtotal + tax, 2)
    reported = round(total, 2)
    discrepancy = round(abs(expected - reported), 2)
    is_valid = discrepancy <= MATH_TOLERANCE
    details = (
        f"Subtotal ${subtotal:,.2f} + tax ${tax:,.2f} = total ${reported:,.2f}."
        if is_valid
        else f"Subtotal ${subtotal:,.2f} + tax ${tax:,.2f} = ${expected:,.2f}, "
        f"but the invoice states ${reported:,.2f} (off by ${discrepancy:,.2f})."
    )
    return MathCheckResult(
        is_valid=is_valid, expected_total=expected, reported_total=reported, discrepancy=discrepancy, details=details
    )
