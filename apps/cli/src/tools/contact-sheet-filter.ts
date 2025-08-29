import type { Command } from "commander";
import type { Tool } from "../types.js";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface ReferenceEntry {
  reference: string;
}

async function promptForFolder(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "📁 Enter the folder location containing contact sheet files: ",
      (answer) => {
        rl.close();
        resolve(answer.trim());
      },
    );
  });
}

function load8HoursData(): string[] {
  try {
    const filePath = path.join(process.cwd(), "24hours.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const jsonData: ReferenceEntry[] = JSON.parse(data);
    return jsonData.map((entry) => entry.reference);
  } catch (error) {
    console.error("❌ Error reading 8hours.json:", error);
    process.exit(1);
  }
}

function findContactSheetFiles(folderPath: string): string[] {
  try {
    if (!fs.existsSync(folderPath)) {
      console.error(`❌ Folder does not exist: ${folderPath}`);
      process.exit(1);
    }

    const files = fs.readdirSync(folderPath);
    const contactSheetPattern = /^(\d{4})_contact_sheet\.jpg$/i;

    return files.filter((file) => {
      const match = file.match(contactSheetPattern);
      return match !== null;
    });
  } catch (error) {
    console.error("❌ Error reading folder:", error);
    process.exit(1);
  }
}

function filterBy8Hours(
  files: string[],
  validReferences: Set<string>,
): string[] {
  const contactSheetPattern = /^(\d{4})_contact_sheet\.jpg$/i;

  return files.filter((file) => {
    const match = file.match(contactSheetPattern);
    if (match) {
      const reference = match[1];
      return validReferences.has(reference);
    }
    return false;
  });
}

async function filterContactSheets(folderPath?: string): Promise<void> {
  // Get folder path from argument or prompt
  let targetFolder = folderPath;
  if (!targetFolder) {
    targetFolder = await promptForFolder();
  }

  console.log(`🔍 Scanning folder: ${targetFolder}`);

  // Load 8hours.json data
  console.log("📖 Loading 8hours.json data...");
  const validReferences = new Set(load8HoursData());
  console.log(`✅ Loaded ${validReferences.size} valid references`);

  // Find contact sheet files
  console.log("🔍 Finding contact sheet files...");
  const contactSheetFiles = findContactSheetFiles(targetFolder);
  console.log(`📁 Found ${contactSheetFiles.length} contact sheet files`);

  // Filter files
  console.log("🔎 Filtering files based on 8hours.json...");
  const filteredFiles = filterBy8Hours(contactSheetFiles, validReferences);
  console.log(`✅ Found ${filteredFiles.length} matching files`);

  if (filteredFiles.length === 0) {
    console.log("ℹ️  No matching files found. No new folder will be created.");
    return;
  }

  // Create new folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const newFolderName = `filtered_contact_sheets_${timestamp}`;
  const newFolderPath = path.join(targetFolder, newFolderName);

  try {
    fs.mkdirSync(newFolderPath, { recursive: true });
    console.log(`📁 Created new folder: ${newFolderName}`);

    // Copy filtered files
    console.log("📋 Copying filtered files...");
    let copiedCount = 0;

    for (const file of filteredFiles) {
      const sourcePath = path.join(targetFolder, file);
      const destPath = path.join(newFolderPath, file);

      try {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`  ✅ Copied: ${file}`);
      } catch (error) {
        console.error(`  ❌ Failed to copy: ${file}`, error);
      }
    }

    console.log(
      `\n🎉 Successfully copied ${copiedCount} files to ${newFolderName}`,
    );
    console.log(`📂 New folder location: ${newFolderPath}`);
  } catch (error) {
    console.error("❌ Error creating new folder:", error);
    process.exit(1);
  }
}

export const contactSheetFilterTool: Tool = {
  name: "filter-contact-sheets",
  description: "Filter contact sheet JPG files based on 8hours.json references",
  register: (program: Command) => {
    const filterCommand = program
      .command("filter-contact-sheets")
      .description(
        "Filter contact sheet files based on 8hours.json references",
      );

    filterCommand
      .command("run")
      .description("Run the contact sheet filter")
      .argument(
        "[folder]",
        "path to folder containing contact sheet files (optional, will prompt if not provided)",
      )
      .action(filterContactSheets);
  },
};
