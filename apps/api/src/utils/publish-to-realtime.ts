import {
  PublishCommand,
  IoTDataPlaneClient,
} from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";

export async function publishToRealtime({
  participantId,
  status,
}: {
  participantId: number;
  status: string;
}) {
  try {
    const client = new IoTDataPlaneClient();
    await client.send(
      new PublishCommand({
        payload: Buffer.from(
          JSON.stringify({
            participantId,
            status,
          }),
        ),
        topic: `${Resource.App.name}/${Resource.App.stage}/participant-status/${participantId}`,
      }),
    );
  } catch (error) {
    console.error("Error publishing to realtime" + participantId, error);
  }
}
