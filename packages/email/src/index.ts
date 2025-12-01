export {
  type OTPEmailParams,
  type ContactSheetEmailParams,
  type JuryInvitationEmailParams,
  type StaffInviteEmailParams,
  type MagicLinkEmailParams,
} from "./templates"

export { OTPEmail, otpEmailSubject, type OTPEmailProps } from "./templates/otp-email"
export {
  MagicLinkEmail,
  magicLinkEmailSubject,
  type MagicLinkEmailProps,
} from "./templates/magic-link-email"

export { EmailService } from "./service"
