import { Effect } from "effect";
import { JsonParseError, InvalidKeyFormatError } from "./errors";

export const parseJson = (input: string) =>
  Effect.try({
    try: () => JSON.parse(input),
    catch: (unknown) => new JsonParseError({ message: "Failed to parse JSON" }),
  });

export const parseKey = (key: string) =>
  Effect.sync(() => {
    const [domain, reference, orderIndex, fileName] = key.split("/");
    if (!domain || !reference || !orderIndex || !fileName) {
      return Effect.fail(
        new InvalidKeyFormatError({
          message: `Missing: domain=${domain}, reference=${reference}, orderIndex=${orderIndex}, fileName=${fileName}`,
        }),
      );
    }
    return Effect.succeed({ domain, reference, orderIndex, fileName });
  }).pipe(Effect.flatten);

export const makeThumbnailKey = (params: {
  domain: string;
  reference: string;
  orderIndex: string;
  fileName: string;
}) =>
  `${params.domain}/${params.reference}/${params.orderIndex}/thumbnail_${params.fileName}`;
