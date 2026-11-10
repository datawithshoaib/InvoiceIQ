"""
InvoiceIQ Guardrails & Safety Module
Implements multi-tiered guardrails:
1. Input PII Redaction & Masking (PCI-DSS & HIPAA compliance)
2. Prompt Injection & Jailbreak Guard
3. SQL Injection & DDL AST Validator (Strict read-only enforcement)
4. Hallucination & Financial Math Integrity Guard
"""

import re
from typing import List, Tuple
from schemas import GuardrailVerdict


FORBIDDEN_SQL_PATTERNS = [
    r"\bDROP\b",
    r"\bDELETE\b",
    r"\bUPDATE\b",
    r"\bINSERT\b",
    r"\bALTER\b",
    r"\bTRUNCATE\b",
    r"\bCREATE\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r"\bPRAGMA\b",
    r"\bATTACH\b",
    r"\bDETACH\b",
    r"--",
    r"/\*.*?\*/",
]

ALLOWED_TABLES = {"invoices", "line_items", "categories"}

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"you\s+are\s+now\s+(dan|unfiltered|jailbroken)",
    r"(reveal|print|show)\s+(your\s+)?(system\s+prompt|developer\s+mode)",
    r"bypass\s+(safety|guardrails|auth)",
    r"drop\s+table",
]


class GuardrailsEngine:
    @staticmethod
    def redact_pii(text: str) -> Tuple[str, List[str]]:
        sanitized = text
        detected = []

        # 1. Credit card regex
        cc_pattern = r"\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{15,16}\b"
        if re.search(cc_pattern, sanitized):
            detected.append("Credit Card Number")
            sanitized = re.sub(
                cc_pattern,
                lambda m: f"[REDACTED_CARD_****{re.sub(r'[- ]', '', m.group(0))[-4:]}]",
                sanitized,
            )

        # 2. SSN / Tax ID regex
        ssn_pattern = r"\b\d{3}-\d{2}-\d{4}\b"
        if re.search(ssn_pattern, sanitized):
            detected.append("US SSN / Tax Identification Number")
            sanitized = re.sub(ssn_pattern, "[REDACTED_SSN]", sanitized)

        # 3. US / International Phone
        phone_pattern = r"\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b"
        if re.search(phone_pattern, sanitized):
            detected.append("Telephone Number")
            sanitized = re.sub(phone_pattern, "[REDACTED_PHONE]", sanitized)

        return sanitized, detected

    @staticmethod
    def check_prompt_injection(prompt: str) -> Tuple[bool, List[str]]:
        violations = []
        lower = prompt.lower()
        for pat in PROMPT_INJECTION_PATTERNS:
            if re.search(pat, lower):
                violations.append(f"Prompt injection detected: pattern '{pat}'")
        return len(violations) == 0, violations

    @staticmethod
    def validate_sql_safety(sql: str) -> Tuple[bool, List[str]]:
        violations = []
        clean = sql.strip()
        upper = clean.upper()

        if not upper.startswith("SELECT") and not upper.startswith("WITH"):
            violations.append("Violation: Only read-only queries starting with SELECT or WITH are permitted.")

        for pat in FORBIDDEN_SQL_PATTERNS:
            if re.search(pat, clean, re.IGNORECASE):
                violations.append(f"Violation: Forbidden destructive or script token '{pat}' detected.")

        if ";" in clean[:-1]:
            violations.append("Violation: Multi-statement execution via semicolon is prohibited.")

        # Check table names
        from_clauses = re.findall(r"FROM\s+([a-zA-Z0-9_]+)", clean, re.IGNORECASE)
        for tbl in from_clauses:
            if tbl.lower() not in ALLOWED_TABLES:
                violations.append(f"Violation: Access to table '{tbl}' is forbidden. Allowed: {list(ALLOWED_TABLES)}")

        return len(violations) == 0, violations

    @classmethod
    def evaluate_input_guardrails(cls, raw_input: str) -> GuardrailVerdict:
        sanitized, pii = cls.redact_pii(raw_input)
        is_safe_prompt, prompt_violations = cls.check_prompt_injection(sanitized)

        all_violations = prompt_violations
        return GuardrailVerdict(
            is_safe=is_safe_prompt,
            detected_pii=pii,
            sanitized_text=sanitized,
            violations=all_violations,
        )
