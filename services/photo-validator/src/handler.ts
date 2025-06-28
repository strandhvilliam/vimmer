import type { SQSEvent } from "aws-lambda";
import { createRule, runValidations } from "@vimmer/validation/validator";

import { z } from "zod";
import { RuleKey } from "@vimmer/validation/types";
import { RULE_KEYS } from "@vimmer/validation/constants";
import { SEVERITY_LEVELS } from "@vimmer/validation/constants";
import { RuleConfig } from "@vimmer/validation/types";
import type { RuleConfig as DbRuleConfig } from "@api/db/types";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { Resource } from "sst";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import superjson from "superjson";

const createApiClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      httpBatchLink({
        url: Resource.Api.url + "trpc",
        transformer: superjson,
      }),
    ],
  });

// Function to map database rule configs to validation rule configs
function mapDbRuleConfigsToValidationConfigs(
  dbRuleConfigs: DbRuleConfig[]
): RuleConfig<RuleKey>[] {
  return dbRuleConfigs
    .filter((rule) => rule.enabled) // Only include enabled rules
    .map((rule) => {
      const ruleKey = rule.ruleKey as RuleKey;
      const severity = rule.severity as "error" | "warning";

      return createRule(ruleKey, severity, rule.params as any);
    });
}

const validationInputSchema = z.object({
  exif: z.record(z.unknown(), { message: "No exif data found" }),
  fileName: z.string().min(1, { message: "File name is required" }),
  fileSize: z.number().nonnegative({ message: "File size is required" }),
  mimeType: z.string().min(1, { message: "Mime type is required" }),
  orderIndex: z.number().int().nonnegative(),
});

export const handler = async (event: SQSEvent): Promise<void> => {
  const apiClient = createApiClient();
  const records = event.Records;
  for (const record of records) {
    const parsedBody = JSON.parse(record.body) as { participantId: number };
    const participantId = parsedBody.participantId;

    if (!participantId) {
      throw new Error("Participant id is required");
    }

    const participant = await apiClient.participants.getById.query({
      id: participantId,
    });

    if (!participant) {
      //TODO: Add error NOT ABLE TO VALIDATE
      throw new Error(`Participant with id ${participantId} not found`);
    }

    if (participant.status === "verified") {
      console.log("Participant is already verified, skipping");
      continue;
    }

    const dbRuleConfigs = await apiClient.rules.getByMarathonId.query({
      marathonId: participant.marathonId,
    });

    const ruleConfigs = mapDbRuleConfigsToValidationConfigs(dbRuleConfigs);

    const topics = await apiClient.topics.getByMarathonId.query({
      id: participant.marathonId,
    });

    const parsedSubmissions = z.array(validationInputSchema).safeParse(
      participant.submissions.map((s) => ({
        exif: s.exif,
        fileName: s.key,
        fileSize: s.size,
        mimeType: s.mimeType,
        orderIndex: topics.find((t) => t.id === s.topicId)?.orderIndex,
      }))
    );

    if (!parsedSubmissions.success) {
      //TODO: Add error MISSING REQUIRED FIELDS
      throw new Error(`Invalid submissions: ${parsedSubmissions.error}`);
    }

    const validationResults = runValidations(
      ruleConfigs,
      parsedSubmissions.data
    ).map((r) => ({
      ...r,
      participantId,
    }));

    await apiClient.validations.createMultipleValidationResults.mutate({
      data: validationResults,
    });
  }
};
