import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@vimmer/ui/components/accordion";
import { ValidationTriggerItem } from "./validation-trigger-item";
import { ValidationItem } from "./validation-item";
import {
  Topic,
  ValidationResult,
  Submission,
  CompetitionClass,
} from "@vimmer/api/db/types";
import { groupValidationsBySubmission } from "@/lib/group-validation-by-submission";
import { getThumbnailUrl } from "@/lib/thumbnail-utils";

interface ValidationAccordionProps {
  validationResults: ValidationResult[];
  submissions: Submission[];
  topics: Topic[];
  competitionClass: CompetitionClass | null;
  baseThumbnailUrl: string;
  submissionBaseUrl?: string;
  previewBaseUrl?: string;
  onThumbnailClick?: (url: string | null) => void;
  onOverrule?: (validationId: number) => void;
  isOverruling?: boolean;
  showOverruleButtons?: boolean;
}

export function ValidationAccordion({
  validationResults,
  submissions,
  topics,
  competitionClass,
  baseThumbnailUrl,
  submissionBaseUrl,
  previewBaseUrl,
  onThumbnailClick,
  onOverrule,
  isOverruling = false,
  showOverruleButtons = false,
}: ValidationAccordionProps) {
  const groupedValidations = groupValidationsBySubmission(
    validationResults,
    submissions,
    topics,
  );

  const allTopicsWithSubmissions = topics
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .slice(0, competitionClass?.numberOfPhotos ?? -1)
    .map((topic) => {
      const submission = submissions.find((s) => s.topicId === topic.id);
      const validations =
        groupedValidations.bySubmission.find(
          (item) => item.orderIndex === topic.orderIndex,
        )?.validations || [];

      return {
        orderIndex: topic.orderIndex,
        topic,
        submission,
        validations,
      };
    });

  return (
    <Accordion type="multiple" className="space-y-2">
      {groupedValidations.global.length > 0 && (
        <AccordionItem
          value="global"
          className="border border-border/50 rounded-xl bg-background/60 backdrop-blur-sm shadow-sm overflow-hidden"
        >
          <ValidationTriggerItem
            isGlobal
            validations={groupedValidations.global}
          />
          <AccordionContent className="border-t pb-0 border-border/30 bg-muted/20">
            {groupedValidations.global.map((validation) => (
              <ValidationItem
                key={validation.id}
                validation={validation}
                onOverrule={onOverrule}
                isOverruling={isOverruling}
                showOverruleButton={showOverruleButtons}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )}

      {allTopicsWithSubmissions.map(
        ({ orderIndex, topic, submission, validations }) => {
          const thumbnailUrl = getThumbnailUrl(
            submission,
            baseThumbnailUrl,
            submissionBaseUrl,
            previewBaseUrl,
          );

          return (
            <AccordionItem
              key={orderIndex}
              value={`submission-${orderIndex}`}
              className="border border-border/50 rounded-xl bg-background/60 backdrop-blur-sm shadow-sm overflow-hidden"
            >
              <ValidationTriggerItem
                topic={topic}
                orderIndex={orderIndex}
                submission={submission}
                validations={validations}
                thumbnailUrl={thumbnailUrl}
                onThumbnailClick={
                  onThumbnailClick
                    ? () => onThumbnailClick(thumbnailUrl)
                    : undefined
                }
              />
              {validations.length > 0 && (
                <AccordionContent className="border-t border-border/30 bg-muted/20">
                  <div className="space-y-2 py-3">
                    {validations.map((validation) => (
                      <ValidationItem
                        key={validation.id}
                        validation={validation}
                        onOverrule={onOverrule}
                        isOverruling={isOverruling}
                        showOverruleButton={showOverruleButtons}
                      />
                    ))}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          );
        },
      )}
    </Accordion>
  );
}
