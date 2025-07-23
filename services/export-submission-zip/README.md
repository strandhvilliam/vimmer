# Export Submission Zip Service

A service that retrieves participant submissions from the database, downloads files from S3, creates a zip file with a specific folder structure, and uploads the zip to another S3 bucket.

## Features

- Fetches all participants with submissions for a specific marathon
- Downloads submission files from S3
- Creates a structured zip file with the following path format:
  `[domain]/[participantReference]/[topicOrderIndexMin2Number].[extension]`
- Uploads individual participant zips and a master zip to a destination S3 bucket
- Tracks and reports progress throughout the process
- Designed to handle thousands of photos efficiently

## Prerequisites

- [Bun](https://bun.sh/) installed
- AWS credentials configured for accessing S3 buckets
- Supabase access configured

## Installation

```bash
bun install
```

## Configuration

This service expects the following environment variables:

```
SOURCE_BUCKET=your-submission-bucket-name
DESTINATION_BUCKET=your-export-bucket-name
```

Alternatively, you can provide these values directly when calling the function.

## Usage

### As a standalone script

```bash
bun run start
```

You can also pass the required parameters directly:

```bash
marathonId=123 SOURCE_BUCKET=my-source-bucket DESTINATION_BUCKET=my-destination-bucket bun run start
```

### As an AWS Fargate task

This service is designed to run as an AWS Fargate task. The expected event input looks like:

```json
{
  "marathonId": 123,
  "sourceBucket": "optional-override-for-source-bucket",
  "destinationBucket": "optional-override-for-destination-bucket"
}
```

### In your code

```typescript
import { exportSubmissionsToZip } from "./index";

const zipFileName = await exportSubmissionsToZip({
  marathonId: 123,
  sourceBucket: "your-source-bucket",
  destinationBucket: "your-destination-bucket",
  progressCallback: (progress) => {
    console.log(
      `Progress: ${progress.processedSubmissions}/${progress.totalSubmissions} files`,
    );
  },
});

console.log(`Export completed: ${zipFileName}`);
```

## Development

### Building

```bash
bun run build
```

This will create a minified Node.js-compatible build in the `dist` directory.

## License

Internal use only
