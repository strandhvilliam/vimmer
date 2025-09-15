import { Resource } from "sst"
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge"

export const handler = async () => {
  const eb = new EventBridgeClient({})

  const result = await eb.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: Resource.SubmissionFinalizedBus.name,
          Source: "blikka.bus.finalized",
          Detail: JSON.stringify({ domain: "demo", reference: "1234" }),
          DetailType: "blikka.bus.finalized",
        },
      ],
    })
  )

  return { result }
}
