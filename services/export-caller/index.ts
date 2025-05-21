import type { LambdaFunctionURLEvent } from "aws-lambda";
import { Resource } from "sst";
import { task } from "sst/aws/task";

type ExportCallerQueryParams = {
  domain: string;
  exportType: "submissions" | "thumbnails" | "previews";
  reference: string;
};

export const handler = async (e: LambdaFunctionURLEvent) => {
  try {
    const queryParams = e.queryStringParameters as ExportCallerQueryParams;

    if (
      !queryParams.domain ||
      !queryParams.exportType ||
      !queryParams.reference
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required parameters" }),
      };
    }

    console.log("queryParams", queryParams);

    await task.run(Resource.GenerateParticipantZipTask, {
      DOMAIN: queryParams.domain,
      EXPORT_TYPE: queryParams.exportType,
      PARTICIPANT_REFERENCE: queryParams.reference,
    });

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
