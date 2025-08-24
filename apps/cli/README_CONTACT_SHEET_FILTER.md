# Contact Sheet Filter Tool

A CLI tool to filter contact sheet JPG files based on references in `8hours.json`.

## Usage

### Run the tool interactively (will prompt for folder location):
```bash
cd apps/cli
bun run src/index.ts filter-contact-sheets run
```

### Run the tool with a specific folder:
```bash
cd apps/cli
bun run src/index.ts filter-contact-sheets run /path/to/your/folder
```

## How it works

1. **Input**: The tool looks for JPG files with the naming pattern `XXXX_contact_sheet.jpg` (where XXXX is a 4-digit number)
2. **Filtering**: It compares the XXXX part against references in `8hours.json`
3. **Output**: Creates a new folder named `filtered_contact_sheets_TIMESTAMP` containing only matching files

## Example

Given these files in your source folder:
- `0915_contact_sheet.jpg` ✅ (exists in 8hours.json)
- `0620_contact_sheet.jpg` ✅ (exists in 8hours.json)
- `9999_contact_sheet.jpg` ❌ (not in 8hours.json)
- `0001_contact_sheet.jpg` ❌ (not in 8hours.json)
- `random_file.txt` ❌ (doesn't match pattern)

The tool will create a new folder with only:
- `0915_contact_sheet.jpg`
- `0620_contact_sheet.jpg`

## Requirements

- Node.js or Bun runtime
- Access to `8hours.json` file in the same directory as the CLI tool
- Source folder containing contact sheet files
