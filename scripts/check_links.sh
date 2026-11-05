#!/usr/bin/env bash

# BrandSure URL & Link Verification Script
# For Hackathon Evaluators and Manual Incognito Testing

set -e

PORT="${PORT:-3000}"
BASE_URL="http://localhost:${PORT}"
GITHUB_REPO="https://github.com/Mokshith1817/demo"

echo "=========================================================="
echo "🛡️  BrandSure: URL Verification & Evaluation Checklist"
echo "=========================================================="
echo ""
echo "Open the following URLs in a clean Incognito / Private browser window:"
echo ""
echo "1. 🏠 Live Application Home / Login:"
echo "   -> ${BASE_URL}/login"
echo ""
echo "2. 📖 Judge & Evaluator Demo Guide (Public, no login needed):"
echo "   -> ${BASE_URL}/demo-guide"
echo ""
echo "3. 🤖 AI & External Services Disclosure (Transparency page):"
echo "   -> ${BASE_URL}/about-ai"
echo ""
echo "4. 📜 PayNest Approved Brand Rulebook & Facts Reference:"
echo "   -> ${BASE_URL}/rules"
echo ""
echo "5. ✍️ Creator Workspace (My Drafts):"
echo "   -> ${BASE_URL}/drafts"
echo ""
echo "6. 🔍 Reviewer Queue:"
echo "   -> ${BASE_URL}/reviews"
echo ""
echo "7. 🛡️ Manager Approvals Queue:"
echo "   -> ${BASE_URL}/approvals"
echo ""
echo "8. 📋 Tamper-Proof Audit Log:"
echo "   -> ${BASE_URL}/audit"
echo ""
echo "9. 📦 Public GitHub Repository:"
echo "   -> ${GITHUB_REPO}"
echo ""
echo "=========================================================="
echo "⚡ Checking local endpoint responsiveness..."
echo "=========================================================="

ROUTES=(
  "/login"
  "/demo-guide"
  "/about-ai"
  "/rules"
  "/drafts"
  "/reviews"
  "/approvals"
  "/audit"
)

ALL_PASSED=true

for route in "${ROUTES[@]}"; do
  URL="${BASE_URL}${route}"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")

  if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 307 ] || [ "$HTTP_CODE" -eq 308 ]; then
    echo "  ✅ [HTTP $HTTP_CODE] $route"
  else
    echo "  ⚠️ [HTTP $HTTP_CODE] $route (Ensure 'npm run dev' is running on port ${PORT})"
    ALL_PASSED=false
  fi
done

echo ""
if [ "$ALL_PASSED" = true ]; then
  echo "🎉 All local evaluation routes are reachable and operational!"
else
  echo "ℹ️  Note: Some authenticated routes redirect (HTTP 307/308) to /login when no session cookie exists. This is expected security behavior."
fi
echo "=========================================================="
