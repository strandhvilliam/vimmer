import { Locale } from "next-intl"

export const LOCALES = ["en", "sv"] satisfies Locale[]

export const DEFAULT_LOCALE: Locale = "en"

// This cookie name is used by `next-intl` on the public pages too. By
// reading/writing to this locale, we can ensure that the user's locale
// is consistent across public and private pages. In case you save the
// locale of registered users in a database, you can of course also use
// that instead when the user is logged in.
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE"

export const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
export const rootDomain = process.env.BLIKKA_PRODUCTION_URL || "localhost:3002"
