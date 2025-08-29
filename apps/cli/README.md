# @vimmer/cli

CLI tool for the Vimmer photo marathon platform.

## Installation

```bash
cd apps/cli
bun install
```

## Development

```bash
# Run in development mode
bun dev

# Build
bun build

# Run built version
bun start
```

## Usage

### List Available Tools

```bash
vimmer tools
```

### Photo Tools

```bash
# Validate a photo
vimmer photo validate ./image.jpg

# Process a photo
vimmer photo process ./image.jpg --resize --quality 85

# Analyze photo metadata
vimmer photo analyze ./image.jpg
```

### Marathon Tools

```bash
# List marathons
vimmer marathon list

# Create a new marathon
vimmer marathon create "Summer 2024" --date 2024-07-15 --topics 20

# Get marathon statistics
vimmer marathon stats mrtn_1234567890
```

### Email Tools

```bash
# Send contact sheets to verified participants
vimmer email send-contact-sheets 123 --limit 10 --from admin@blikka.app

# Test mode with hardcoded data (safe for development)
vimmer email send-contact-sheets 123 --test --limit 5

# Preview what emails would be sent (no actual sending)
vimmer email preview-contact-sheets 123 --limit 10

# Check marathon email status
vimmer email status 123

# Send test email to specific participant
vimmer email test 456
```

#### Email Tool Features

- **🔐 Safe Test Mode**: Use `--test` flag to send emails with hardcoded test data
- **📊 Progress Tracking**: Real-time progress with detailed logging
- **🎯 Participant Filtering**: Automatically skips participants who already received emails
- **📎 S3 Attachments**: Downloads and attaches contact sheets from S3 storage
- **⚙️ Flexible Options**: Control limits, sender address, and recipients
- **📈 Status Tracking**: Uses `contact_sheet_sent` database field to track email status
- **🚫 Contact Sheet Required**: Emails are NOT sent if contact sheet is missing - treated as failure

## Adding New Tools

1. Create a new tool file in `src/tools/`
2. Implement the `Tool` interface
3. Add the tool to `src/tools/index.ts`

Example tool structure:

```typescript
export const myTool: Tool = {
  name: "mytool",
  description: "Description of my tool",
  register: (program: Command) => {
    const command = program.command("mytool");
    // Add subcommands here
  },
};
```
