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
    // const queryParams = e.queryStringParameters as ExportCallerQueryParams;
    //
    // if (
    //   !queryParams.domain ||
    //   !queryParams.exportType ||
    //   !queryParams.reference
    // ) {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ error: "Missing required parameters" }),
    //   };
    // }

    await task.run(Resource.ContactSheetGenerator, {
      // DOMAIN: "demo",
      PARTICIPANT_ID: "176",
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
