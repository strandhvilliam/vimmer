#!/usr/bin/env node

// Simple test script to demonstrate the contact sheet filter functionality
// This can be run with: node test-contact-sheet-filter.js

const fs = require('fs');
const path = require('path');

// Mock data similar to 8hours.json
const mock8HoursData = [
  { reference: "0915" },
  { reference: "0620" },
  { reference: "0748" },
  { reference: "0257" }
];

function testFilterLogic() {
  console.log("🧪 Testing Contact Sheet Filter Logic\n");

  // Sample files that might be in a folder
  const sampleFiles = [
    "0915_contact_sheet.jpg",
    "0620_contact_sheet.jpg",
    "9999_contact_sheet.jpg",
    "0748_contact_sheet.jpg",
    "0257_contact_sheet.jpg",
    "invalid_file.jpg",
    "123_contact_sheet.jpg", // too short
    "12345_contact_sheet.jpg", // too long
    "random_file.txt",
    "another_doc.pdf"
  ];

  console.log("📁 Sample files in folder:");
  sampleFiles.forEach(file => console.log(`  - ${file}`));

  // Extract valid references
  const validReferences = new Set(mock8HoursData.map(entry => entry.reference));
  console.log(`\n✅ Valid references from 8hours.json: ${Array.from(validReferences).join(", ")}`);

  // Filter files
  const contactSheetPattern = /^(\d{4})_contact_sheet\.jpg$/i;
  const matchingFiles = sampleFiles.filter(file => {
    const match = file.match(contactSheetPattern);
    if (match) {
      const reference = match[1];
      return validReferences.has(reference);
    }
    return false;
  });

  console.log("\n🎯 Files that would be copied to new folder:");
  matchingFiles.forEach(file => console.log(`  ✅ ${file}`));

  const nonMatchingFiles = sampleFiles.filter(file => !matchingFiles.includes(file));
  console.log("\n❌ Files that would be excluded:");
  nonMatchingFiles.forEach(file => console.log(`  ❌ ${file}`));

  console.log(`\n📊 Summary: ${matchingFiles.length} files would be copied, ${nonMatchingFiles.length} files would be excluded`);
}

// Run the test
testFilterLogic();
