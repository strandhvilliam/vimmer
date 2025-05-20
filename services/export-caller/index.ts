import type { LambdaFunctionURLEvent } from "aws-lambda";
import { Resource } from "sst";
import { task } from "sst/aws/task";

type ExportCallerQueryParams = {
  domain: string;
  exportType: "submissions" | "thumbnails" | "previews";
};

export const handler = async (e: LambdaFunctionURLEvent) => {
  try {
    const queryParams = e.queryStringParameters as ExportCallerQueryParams;

    if (!queryParams.domain || !queryParams.exportType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required parameters" }),
      };
    }

    await task.run(Resource.ExportSubmissionsTask, {
      DOMAIN: queryParams.domain,
      EXPORT_TYPE: queryParams.exportType,
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
