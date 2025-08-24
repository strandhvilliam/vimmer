# Batch Contact Sheet Generator

This service provides batch processing functionality for contact sheet generation, designed to avoid database connection limits by performing all S3 uploads first and then doing batch database updates.

## Key Differences from the Original Lambda

1. **Batch Processing**: Processes all contact sheets and uploads to S3 before updating the database
2. **Connection Management**: Avoids "max connections reached" errors by minimizing database calls
3. **Better Error Handling**: Separate tracking of processing errors vs database update errors
4. **Local Execution**: Designed to run locally rather than as a Lambda function
5. **Smart Participant Discovery**: Queries database directly to find eligible participants

## Quick Start

1. **Edit the configuration** in `run-batch.ts`:

   ```typescript
   const options: RunBatchOptions = {
     domain: "your-actual-domain", // Replace with your domain
     requireSubmissions: true, // Only process participants with submissions
     requireValidPhotoCount: true, // Only process 8 or 24 photo participants
     excludeExistingContactSheets: true, // Skip participants who already have contact sheets
     limitParticipants: 10, // Limit for testing (remove for full batch)
   };
   ```

2. **Run the batch processor**:
   ```bash
   cd services/batch-contact-sheet-generator
   bun run run-batch.ts
   ```

## Configuration Options

- `domain`: The domain/marathon identifier
- `requireSubmissions`: Only process participants with photo submissions
- `requireValidPhotoCount`: Only process participants with valid photo counts (8 or 24)
- `excludeExistingContactSheets`: Skip participants who already have contact sheets
- `limitParticipants`: Limit number of participants (useful for testing)
- `onlyParticipantRefs`: Process only specific participant references

## Function Flow

1. **Discovery Phase**: Query database for participants matching criteria
2. **Generation Phase**: For each participant:
   - Fetch participant data, sponsors, and topics
   - Validate submissions and photo counts
   - Generate contact sheet with sponsors/topics
   - Upload to S3
   - Store success results for batch update

3. **Database Update Phase**:
   - Perform single database update per successful generation
   - Track update results separately

## Output

The script provides detailed logging and a final summary:

- Total participants processed
- Success/failure counts for generation and database updates
- Detailed error messages for failures
- List of successfully generated contact sheet keys
