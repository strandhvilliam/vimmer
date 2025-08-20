export interface EmailParticipant {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  reference: string;
  contactSheetKey: string | null;
  contactSheetSent: boolean | null;
  marathonId: number;
}

export interface EmailOptions {
  limit?: number;
  test?: boolean;
  skipSent?: boolean;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  participantId: number;
  email: string;
  error?: string;
}

export interface EmailSummary {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export interface TestParticipant {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  reference: string;
  contactSheetKey: string;
}
