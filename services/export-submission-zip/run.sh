#!/bin/bash
# Simple shell script to run the export service

# Check if all required parameters are provided
if [ -z "$MARATHON_ID" ]; then
  echo "Error: MARATHON_ID environment variable is required"
  echo "Usage: MARATHON_ID=123 SOURCE_BUCKET=bucket-name DESTINATION_BUCKET=export-bucket ./run.sh"
  exit 1
fi

# Set default buckets if not provided
SOURCE_BUCKET=${SOURCE_BUCKET:-"vimmer-development-submissionbucketbucket-mssednck"}
DESTINATION_BUCKET=${DESTINATION_BUCKET:-"vimmer-development-exportzipbucketbucket-mssednck"}

echo "Starting export with:"
echo "  Marathon ID: $MARATHON_ID"
echo "  Source bucket: $SOURCE_BUCKET"
echo "  Destination bucket: $DESTINATION_BUCKET"

# Run the export service
MARATHON_ID=$MARATHON_ID \
SOURCE_BUCKET=$SOURCE_BUCKET \
DESTINATION_BUCKET=$DESTINATION_BUCKET \
bun run start 