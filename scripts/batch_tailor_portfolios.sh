#!/bin/bash

# Configuration
PROVIDER="groq"
MODEL="qwen/qwen3-32b"
INPUT="project-details-ai.json"

# Find all job_description.md files in subdirectories
JD_FILES=$(find . -maxdepth 2 -name "job_description.md" | grep -v "^\./job_description.md")

echo "🚀 Starting Batch Portfolio Tailoring..."
echo "JD Files found:"
echo "$JD_FILES"
echo "--------------------------------"

for JD in $JD_FILES; do
    DIR=$(dirname "$JD")
    OUTPUT="${DIR}/project-details.json"
    
    echo "Processing: ${DIR}"
    echo "Using context: ${JD}"
    
    python3 scripts/agentic_chronicler.py \
        --input "$INPUT" \
        --output "$OUTPUT" \
        --context "$JD" \
        --provider "$PROVIDER" \
        --model "$MODEL" \
        --tailor-only \
        --force
    
    echo "✅ Finished: ${DIR}"
    echo "--------------------------------"
done

echo "🎉 All portfolios tailored successfully!"
