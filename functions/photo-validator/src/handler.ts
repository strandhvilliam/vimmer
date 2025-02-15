import type { LambdaFunctionURLEvent } from "aws-lambda";

export const handler = async (event: LambdaFunctionURLEvent): Promise<void> => {
  console.log("Event: ", JSON.stringify(event));
};
