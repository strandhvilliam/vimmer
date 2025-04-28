#!/usr/bin/env bun
import { exportSubmissionsToZip, handler } from "./index";

async function main() {
  // Check if we're running through the CLI
  const args = process.argv.slice(2);

  let marathonId: number | undefined;
  let sourceBucket: string | undefined;
  let destinationBucket: string | undefined;

  // Parse CLI args
  for (const arg of args) {
    const [key, value] = arg.split("=");
    switch (key) {
      case "marathonId":
        marathonId = parseInt(value, 10);
        break;
      case "sourceBucket":
        sourceBucket = value;
        break;
      case "destinationBucket":
        destinationBucket = value;
        break;
    }
  }

  // Check environment variables if not provided via CLI
  marathonId =
    marathonId ||
    (process.env.MARATHON_ID
      ? parseInt(process.env.MARATHON_ID, 10)
      : undefined);
  sourceBucket = sourceBucket || process.env.SOURCE_BUCKET;
  destinationBucket = destinationBucket || process.env.DESTINATION_BUCKET;

  if (!marathonId) {
    console.error("Error: marathonId is required");
    process.exit(1);
  }

  if (!sourceBucket) {
    console.error("Error: sourceBucket is required");
    process.exit(1);
  }

  if (!destinationBucket) {
    console.error("Error: destinationBucket is required");
    process.exit(1);
  }

  try {
    const result = await handler();

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
