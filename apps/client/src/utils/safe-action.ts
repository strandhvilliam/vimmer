import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) {
      if (e.serverError) {
        console.error(e.serverError)
      }
      return e.message
    }
    console.error('UNEXPECTED ERROR', e)
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})

export class ActionError extends Error {
  constructor(
    message: string,
    public serverError: Error | null = null,
  ) {
    super(message)
  }
}
