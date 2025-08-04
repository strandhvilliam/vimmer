import { Submission, Topic, ValidationResult } from "@vimmer/api/db/types";

export interface GroupedValidations {
  global: ValidationResult[];
  bySubmission: Array<{
    orderIndex: number;
    topic: Topic;
    submission: Submission | null;
    validations: ValidationResult[];
  }>;
}

const parseFileNameForOrderIndex = (fileName: string): number | null => {
  const parts = fileName.split("/");
  if (parts.length < 3) return null;

  const fileNamePart = parts[2];
  if (!fileNamePart) return null;

  const parsedNumber = parseInt(fileNamePart, 10) - 1;
  if (isNaN(parsedNumber)) return null;
  return parsedNumber;
};

export function groupValidationsBySubmission(
  validations: ValidationResult[],
  submissions: Submission[],
  topics: Topic[],
): GroupedValidations {
  const global: ValidationResult[] = [];
  const topicsOrderMap = new Map<number, ValidationResult[]>();

  validations.forEach((validation) => {
    if (!validation.fileName) {
      global.push(validation);
      return;
    }

    const orderIndex = parseFileNameForOrderIndex(validation.fileName);
    if (orderIndex === null) {
      global.push(validation);
      return;
    }

    if (!topicsOrderMap.has(orderIndex)) {
      topicsOrderMap.set(orderIndex, []);
    }
    topicsOrderMap.get(orderIndex)!.push(validation);
  });

  const bySubmission = Array.from(topicsOrderMap.entries())
    .map(([orderIndex, validations]) => {
      const topic = topics.find((t) => t.orderIndex === orderIndex);
      if (!topic) return null;
      const submission =
        submissions.find((s) => {
          const submissionTopic = topics.find((t) => t.id === s.topicId);
          return submissionTopic?.orderIndex === orderIndex;
        }) || null;

      return {
        orderIndex,
        topic,
        submission,
        validations: validations.sort((a, b) => {
          if (a.outcome === "failed" && b.outcome !== "failed") return -1;
          if (a.outcome !== "failed" && b.outcome === "failed") return 1;
          return 0;
        }),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return {
    global: global.sort((a, b) => {
      if (a.outcome === "failed" && b.outcome !== "failed") return -1;
      if (a.outcome !== "failed" && b.outcome === "failed") return 1;
      return 0;
    }),
    bySubmission,
  };
}
