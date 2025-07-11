#!/usr/bin/env bash
set -euo pipefail

# Nombre del bucket donde se almacenarán los artefactos SAM
S3_BUCKET="smartdevice-sam-artifacts-gsinbandera"

# Nombre de la stack CloudFormation
STACK_NAME="smart-device-api-stack"

# Región
REGION="us-east-1"

echo "1/3 ▶️ Building SAM application…"
sam build

echo "2/3 ▶️ Packaging template and uploading artifacts to s3://${S3_BUCKET}…"
aws cloudformation package \
  --template-file template.yml \
  --s3-bucket "${S3_BUCKET}" \
  --output-template-file packaged-template.yml

echo "3/3 ▶️ Deploying CloudFormation stack (${STACK_NAME})…"
aws cloudformation deploy \
  --template-file packaged-template.yml \
  --stack-name "${STACK_NAME}" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --region "${REGION}"

echo "✅ Deployment completed!"  
