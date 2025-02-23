import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  Submission,
} from "@vimmer/supabase/types";

export interface ParticipantData extends Participant {
  submissions: Submission[];
  competitionClass: CompetitionClass | null;
  deviceGroup: DeviceGroup | null;
}
