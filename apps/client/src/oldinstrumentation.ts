// import { NextRequest } from "next/server";
// import { type Instrumentation } from "next";

// export function register() {
//   // No-op for initialization
// }

// export const onRequestError: Instrumentation.onRequestError = async (
//   err,
//   request
// ) => {
//   if (process.env.NEXT_RUNTIME === "nodejs") {
//     const { posthogServer } = await import("./lib/posthog-server");

//     let distinctId = null;
//     if (request.headers.cookie) {
//       const cookieString = request.headers.cookie;
//       if (typeof cookieString !== "string") {
//         return;
//       }

//       const postHogCookieMatch = cookieString.match(
//         /ph_phc_.*?_posthog=([^;]+)/
//       );
//       console.log("postHogCookieMatch", postHogCookieMatch);

//       if (postHogCookieMatch && postHogCookieMatch[1]) {
//         try {
//           const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
//           const postHogData = JSON.parse(decodedCookie);
//           distinctId = postHogData.distinct_id;
//         } catch (e) {
//           console.error("Error parsing PostHog cookie:", e);
//         }
//       }
//     }

//     posthogServer.capture({
//       event: "error",
//       distinctId: distinctId || undefined,
//       properties: {
//         error: err,
//       },
//     });
//   }
// };
