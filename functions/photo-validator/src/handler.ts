import { createClient } from "@vimmer/supabase/lambda";
import { getParticipantById } from "@vimmer/supabase/queries";
import {
  createRule,
  ServerValidator,
  type ServerFile,
} from "@vimmer/validation/server";
import type { Handler } from "aws-lambda";

export const handler: Handler = async (event): Promise<void> => {
  const participantId = event.participantId;

  if (!participantId) {
    throw new Error("Participant id is required");
  }

  const supabase = await createClient();

  const participantWithSubmissions = await getParticipantById(
    supabase,
    participantId,
  );
  if (!participantWithSubmissions) {
    throw new Error(`Participant with id ${participantId} not found`);
  }
  // Get marathon config and rules
  // Check that the submission amount is the same as uploadcount. Yes == do nothing, No == add warning to submissionerror table

  const validator = new ServerValidator([
    createRule({
      key: "allowed_file_types",
      level: "error",
      params: { extensions: ["jpg"], mimeTypes: ["image/jpeg"] },
    }),
    createRule({
      key: "same_device",
      level: "error",
      params: {},
    }),
  ]);

  const filesToValidate: ServerFile[] =
    participantWithSubmissions.submissions.map((s) => ({
      exif: s.exif,
      originalname: s.key.split("/").pop() as string,
      mimetype: s.mimeType as string,
      size: s.size as number,
    }));

  const invalidFiles = await validator.validate(filesToValidate);

  // save invalidFiles to submissionerror table
  console.log(invalidFiles);
};
