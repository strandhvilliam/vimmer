export interface GridConfig {
  cols: number;
  rows: number;
  sponsorRow: number;
  sponsorCol: number;
}

export type SponsorPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "center";

export interface ImageFile {
  key: string;
  orderIndex: number;
  buffer: Buffer;
}

export interface TopicWithIndex {
  name: string;
  orderIndex: number;
}

export interface CreateContactSheetParams {
  domain: string;
  keys: string[];
  participantRef: string;
  sponsorPosition: SponsorPosition;
  sponsorKey: string | undefined;
  topics: TopicWithIndex[];
}
