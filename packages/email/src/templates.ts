export interface OTPEmailParams {
  readonly to: string | string[]
  readonly from?: string
  readonly otp: string
  readonly username?: string
  readonly expiryMinutes?: number
  readonly companyName?: string
  readonly companyLogoUrl?: string
}

export interface ContactSheetEmailParams {
  readonly to: string | string[]
  readonly from?: string
  readonly participantName: string
  readonly eventName: string
  readonly contactSheetUrl: string
  readonly companyName?: string
  readonly companyLogoUrl?: string
}

export interface JuryInvitationEmailParams {
  readonly to: string | string[]
  readonly from?: string
  readonly juryName: string
  readonly eventName: string
  readonly invitationUrl: string
  readonly eventDate?: string
  readonly companyName?: string
  readonly companyLogoUrl?: string
}

export interface StaffInviteEmailParams {
  readonly to: string | string[]
  readonly from?: string
  readonly staffName: string
  readonly inviterName: string
  readonly invitationUrl: string
  readonly role?: string
  readonly companyName?: string
  readonly companyLogoUrl?: string
}

export interface MagicLinkEmailParams {
  readonly to: string | string[]
  readonly from?: string
  readonly url: string
  readonly email: string
  readonly username?: string
  readonly expiryMinutes?: number
  readonly companyName?: string
  readonly companyLogoUrl?: string
}
