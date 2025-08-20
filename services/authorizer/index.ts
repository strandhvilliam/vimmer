import { Resource } from "sst";
import { realtime } from "sst/aws/realtime";

export const handler = realtime.authorizer(async (token) => {
  const prefix = `${Resource.App.name}/${Resource.App.stage}`;

  const isValid = token === "PLACEHOLDER_TOKEN";
  console.log("token", token);
  console.log("isValid", isValid);

  return {
    publish: [`*`],
    subscribe: [`*`],
  };
  return {
    publish: [
      `${prefix}/revalidate`,
      `${prefix}/participant-status`,
      `${prefix}/submissions-status`,
    ],
    subscribe: [
      `${prefix}/revalidate`,
      `${prefix}/participant-status`,
      `${prefix}/submissions-status`,
    ],
  };
});
