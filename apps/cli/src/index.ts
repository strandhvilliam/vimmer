#!/usr/bin/env node

import { Command } from "commander";
import { tools } from "./tools/index.js";

const program = new Command();

program
  .name("vimmer")
  .description("CLI for Vimmer photo marathon platform")
  .version("0.1.0");

// Register all tools
for (const tool of tools) {
  tool.register(program);
}

// Add help command that lists available tools
program
  .command("tools")
  .description("List all available tools")
  .action(() => {
    console.log("🛠️  Available Tools:\n");
    for (const tool of tools) {
      console.log(`📦 ${tool.name.padEnd(12)} - ${tool.description}`);
    }
    console.log("\nUse 'vimmer <tool> --help' for tool-specific commands");
  });

program.parse();
