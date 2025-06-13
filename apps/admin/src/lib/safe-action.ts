import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) {
      return e.message;
    }
    console.error("UNEXPECTED ERROR", e);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export class ActionError extends Error {}
