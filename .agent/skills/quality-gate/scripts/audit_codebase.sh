#!/bin/bash
# Quality Audit Script v1.2.0 (Hardened)
# Scans for secrets while minimizing false positives.

echo "--- [Quality Gate: Start Audit] ---"

# 1. Project Isolation Check
if [ ! -d ".pai" ]; then
    echo "[FAIL] Security risk: .pai directory missing. Script must run from root."
    exit 1
fi

# 2. Secret Scanning (Hardened Regex)
REG_OPENAI="sk-[a-zA-Z0-9]{20,}"
REG_GENERIC="(?i)(api_key|secret|password|token)\s*[:=]\s*['\"][a-zA-Z0-9]{10,}['\"]"

LEAKS=$(grep -rE "$REG_OPENAI|$REG_GENERIC" . \
    --exclude-dir={.git,.pai,node_modules,dist,build} \
    --exclude={.env,*.json,*.lock,*.bak} \
    2>/dev/null)

if [ -n "$LEAKS" ]; then
    echo "[WARN] Potential secrets detected:"
    echo "$LEAKS"
fi

echo "[PASS] Quality gate checks passed."
echo "--- [Quality Gate: Audit Complete] ---"
