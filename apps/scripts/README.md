# Scripts

A collection of utility scripts with database and S3 access.

## Setup

```bash
bun install
```

## Available Scripts

### Process Uploads

Processes participants with status 'ready_to_upload' for a given domain, validates their submissions exist in S3, and updates statuses accordingly.

```bash
# Process uploads for a specific domain
bun process-uploads mydomain.com

# Alternative syntax
bun start mydomain.com
```

**Features:**

- Fetches participants with status 'ready_to_upload' by domain
- Gets latest participant per reference (deduplicates)
- Validates submission count against competition class requirements
- Checks S3 metadata for each submission key
- Updates submission status to 'uploaded' if files exist
- Marks participants as 'completed' when all submissions are uploaded
- Processes maximum 10 participants per run
- Generates comprehensive processing report

**Environment Variables Required:**

- `DATABASE_URL`: PostgreSQL connection string
- `SUBMISSION_BUCKET_NAME`: S3 bucket name for submissions
- `AWS_REGION` (optional): AWS region, defaults to 'us-east-1'

## Available Tools

- **Database**: Drizzle ORM with PostgreSQL connection and schema access
- **S3**: AWS S3 client with metadata checking utilities
- **Validation**: Access to @vimmer/validation schemas
- **Supabase**: Access to @vimmer/supabase utilities

## Creating Scripts

Add new scripts in the `src/` directory and import the required utilities:

```typescript
import { db } from "./db";
import { s3Client, HeadObjectCommand } from "./s3";
import { checkS3ObjectMetadata } from "./utils/s3-checker";
import { getReadyToUploadParticipants } from "./utils/queries";
```
