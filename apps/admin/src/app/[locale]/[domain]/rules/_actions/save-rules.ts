"use server";

import { actionClient } from "@/lib/safe-action";
import {
  rulesFormSchema,
  RulesFormValues,
} from "../_types/update-rules-schema";

export const saveRules = actionClient
  .schema(rulesFormSchema)
  .action(async ({ parsedInput: rules }) => {
    try {
      // Simulate a delay for saving to the database
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log what would be saved
      console.log("Rules saved to database:", JSON.stringify(rules, null, 2));

      // In a real implementation, we would save to the database here
      // For example:
      // await db.rules.upsert({...})

      return {
        success: true,
        message: "Rules saved successfully",
      };
    } catch (error) {
      console.error("Error saving rules:", error);
      return {
        success: false,
        message: "Failed to save rules",
      };
    }
  });
