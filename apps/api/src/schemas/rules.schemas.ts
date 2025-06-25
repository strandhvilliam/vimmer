import { z } from "zod/v4";

export const getRulesByMarathonIdSchema = z.object({
  marathonId: z.number(),
});

export const getRulesByDomainSchema = z.object({
  domain: z.string(),
});

export const getRuleConfigByMarathonIdAndRuleKeySchema = z.object({
  marathonId: z.number(),
  ruleKey: z.string(),
});

export const createRuleConfigSchema = z.object({
  data: z.object({
    ruleKey: z.string(),
    marathonId: z.number(),
    params: z.any().optional(),
    severity: z.string().default("warning"),
  }),
});

export const updateRuleConfigSchema = z.object({
  id: z.number(),
  data: z.object({
    ruleKey: z.string().optional(),
    marathonId: z.number().optional(),
    params: z.any().optional(),
    severity: z.string().optional(),
  }),
});

export const deleteRuleConfigSchema = z.object({
  id: z.number(),
});

export const updateRuleConfigByMarathonIdAndRuleKeySchema = z.object({
  marathonId: z.number(),
  ruleKey: z.string(),
  data: z.object({
    params: z.any().optional(),
    severity: z.string().optional(),
  }),
});

export const deleteRuleConfigByMarathonIdAndRuleKeySchema = z.object({
  marathonId: z.number(),
  ruleKey: z.string(),
});
