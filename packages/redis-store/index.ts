import { Redis } from "@upstash/redis"
import { parseArgs } from "util"
import { UploadStateRepo } from "./src/upload-state-repo"
import { Effect } from "effect"

const UPSTASH_REDIS_REST_URL = "https://fond-python-5774.upstash.io"
const UPSTASH_REDIS_REST_TOKEN =
  "ARaOAAImcDFmNmUwYzY3YjE2Njk0OTVjYTJiOTI4YThmY2NlM2RkYnAxNTc3NA"

async function initializeParticipant(redis: Redis, key: string) {
  const exists = await redis.exists(key)
  if (exists) return

  await redis.hset(key, {
    expectedCount: 4,
    processedIndexes: [0, 0, 0, 0],
    zipUrl: "",
    validated: false,
    contactSheetUrl: "",
    errors: [],
    finalized: 0,
  })
}

function saveCurrentStateToDb() {
  // save current state to db
}

function initializeParticipantStateInRedis() {
  // initialize participant state in redis
}

async function handleUploadedSubmission(oidx: string) {
  const redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  })

  const domain = "testdomain"
  const ref = "1234"
  const key = `participant:${domain}:${ref}`
  await initializeParticipant(redis, key)

  const topics = new Map<number, string>([
    [0, "topic0"],
    [1, "topic1"],
    [2, "topic2"],
    [3, "topic3"],
    [4, "topic4"],
  ])

  const topic = topics.get(+oidx)
  if (!topic) {
    console.log("Topic not found, skipping")
    return
  }

  // extract exif --if fail still continues with null exif
  // generate thumbnail --if fail still continues with null thumbnail

  // update submission:[domain]:[ref]:[oidx]
  //   - thumbnailKey: generated thumbnail key
  //   - uploaded: true

  // set exif submission:[domain]:[ref]:[oidx]:exif to exif json

  // increment the processed count on participant
  const incrementScript = await Bun.file("increment.lua").text()
  const [status] = await redis.eval<string[], [string]>(
    incrementScript,
    [key],
    [oidx]
  )

  switch (status) {
    case "FINALIZED":
      console.log("Finalized, ready to aggregate")
      break

    case "PROCESSED_SUBMISSION":
      console.log("Processed submission, skipping")
      break

    case "DUPLICATE_ORDER_INDEX":
    case "ALREADY_FINALIZED":
      console.log("Expected error status, skipping")
      break

    case "INVALID_ORDER_INDEX":
    case "MISSING_DATA":
      console.log("Unexpected error, make alert")
      break

    default:
      console.log("Unknown status")
  }
}

function handleFinalizedSubmission(oidx: string) {
  // save current state to db
  // start validation
  // start contact sheet generation
  // start zip generation
}

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      oidx: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  })
  if (!values.oidx) {
    console.error("oidx is required")
    process.exit(1)
  }
  await handleUploadedSubmission(values.oidx)
  // const redis = new Redis({
  //   url: UPSTASH_REDIS_REST_URL,
  //   token: UPSTASH_REDIS_REST_TOKEN,
  // })

  // await redis.eval(luaIncrement, ["foo3"], ["1"])
  // const foo = await redis.get("foo3")
  // console.log(foo)
}

main()

const effect = Effect.gen(function* () {
  const uploadStateRepo = yield* UploadStateRepo

  const result = yield* uploadStateRepo.incrementParticipantState(
    "testdomain",
    "1234",
    "0"
  )
}).pipe(Effect.provide(UploadStateRepo.Default))
