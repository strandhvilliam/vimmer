import type { Command } from "commander";
import type { Tool } from "../types.js";

function listMarathons(): void {
  console.log(`📋 Available Photo Marathons:`);
  console.log(`1. Stockholm Summer 2024 - Active`);
  console.log(`2. Nordic Wildlife 2024 - Upcoming`);
  console.log(`3. Urban Life 2024 - Completed`);
}

function createMarathon(
  name: string,
  options: { date?: string; topics?: number },
): void {
  console.log(`🎯 Creating new marathon: ${name}`);

  if (options.date) {
    console.log(`📅 Scheduled for: ${options.date}`);
  }

  if (options.topics) {
    console.log(`📝 Number of topics: ${options.topics}`);
  }

  console.log(`✅ Marathon created successfully`);
  console.log(`🔗 Marathon ID: mrtn_${Date.now()}`);
}

function getMarathonStats(marathonId: string): void {
  console.log(`📊 Marathon Statistics for: ${marathonId}`);
  console.log(`👥 Participants: 127`);
  console.log(`📸 Total submissions: 1,254`);
  console.log(`✅ Approved: 1,180`);
  console.log(`⏳ Pending review: 74`);
  console.log(`🏆 Top scorer: @photographer_pro (18/20 topics)`);
}

export const marathonTool: Tool = {
  name: "marathon",
  description: "Photo marathon management and statistics",
  register: (program: Command) => {
    const marathonCommand = program
      .command("marathon")
      .description("Photo marathon management tools");

    marathonCommand
      .command("list")
      .description("List all photo marathons")
      .action(listMarathons);

    marathonCommand
      .command("create")
      .description("Create a new photo marathon")
      .argument("<name>", "marathon name")
      .option("-d, --date <date>", "marathon date (YYYY-MM-DD)")
      .option("-t, --topics <number>", "number of topics", parseInt)
      .action(createMarathon);

    marathonCommand
      .command("stats")
      .description("Get marathon statistics")
      .argument("<id>", "marathon ID")
      .action(getMarathonStats);
  },
};
