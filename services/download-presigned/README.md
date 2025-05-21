# Download Presigned URL Service

This service provides a handler function that generates a presigned URL to download a zip file containing all participant photos for a given marathon domain.

## Usage

The function expects an event object with the following structure:

```typescript
{
  domain: string; // The domain name of the marathon
}
```

### Example Request

```typescript
const result = await handler({
  domain: "photomarathon",
});
```

### Response

On success:

```typescript
{
  url: string; // The presigned URL to download the zip file
  expires: Date; // The expiration time of the URL
}
```

On error:

```typescript
{
  error: string; // Error message
}
```

## Integration with SST

To integrate this function with SST, add it to the `sst.config.ts` file:

```typescript
const downloadPresignedFunction = new sst.aws.Function(
  "DownloadPresignedFunction",
  {
    handler: "services/download-presigned/index.handler",
    environment: env,
    link: [exportsBucket],
    permissions: [
      {
        actions: ["s3:GetObject"],
        resources: [exportsBucket.arn],
      },
    ],
    url: true,
  }
);
```

Then, you can call this function from your application by sending a POST request to the function's URL with the marathon domain in the request body.
