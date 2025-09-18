import { Participant } from "@blikka/db"

export function makeNewZipDto(domain: string, participant: Participant) {
  return {
    data: {
      marathonId: participant.marathonId,
      participantId: participant.id,
      zipKey: `${domain}/${participant.reference}.zip`,
      exportType: "zip",
      progress: 100,
      status: "completed",
      errors: [],
    },
  }
}
