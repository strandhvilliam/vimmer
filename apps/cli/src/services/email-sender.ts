import { Resend, type CreateEmailOptions } from "resend";
import type { EmailParticipant, EmailResult } from "../types/email.js";
import { downloadContactSheet, getContactSheetFilename } from "./s3-client.js";
import { ContactSheetEmail } from "@vimmer/email/contact-sheet-email";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function createContactSheetEmailHtml(
  participantName: string,
  marathonName: string,
  participantReference: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Contact Sheet from ${marathonName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; text-align: center; margin-bottom: 30px; font-size: 24px; }
    p { color: #333; line-height: 1.6; margin-bottom: 16px; }
    .highlight { background: #f0f9ff; padding: 16px; border-left: 4px solid #3b82f6; margin: 20px 0; }
    .footer { font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Your Contact Sheet is Ready!</h1>
    
    <p>Hello <strong>${participantName}</strong>,</p>
    
    <p>Thank you for participating in <strong>${marathonName}</strong>! Your contact sheet has been generated and is attached to this email.</p>
    
    <div class="highlight">
      <p><strong>Participant Details:</strong></p>
      <p>• Reference: <strong>${participantReference}</strong><br>
      • Marathon: <strong>${marathonName}</strong></p>
    </div>
    
    <p>Your contact sheet contains a preview of all your submitted photos. This serves as a record of your participation and can be used for portfolio purposes.</p>
    
    <p>If you have any questions about your submission or the marathon results, please don't hesitate to contact us.</p>
    
    <div class="footer">
      <p>This contact sheet was automatically generated for your participation in ${marathonName}. Please keep this email for your records.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendContactSheetEmail(
  participant: EmailParticipant,
  marathonName: string,
  fromEmail?: string,
): Promise<EmailResult> {
  try {
    console.log(
      `📧 Sending email to ${participant.email} (${participant.reference})`,
    );

    // Download contact sheet attachment - required for email to be sent
    let attachment = null;
    if (participant.contactSheetKey) {
      const contactSheetBuffer = await downloadContactSheet(
        participant.contactSheetKey,
      );
      if (contactSheetBuffer) {
        attachment = {
          filename: getContactSheetFilename(
            participant.contactSheetKey,
            participant.reference,
          ),
          content: contactSheetBuffer,
        };
      } else {
        console.error(
          `❌ Could not download contact sheet for ${participant.reference}`,
        );
        return {
          success: false,
          participantId: participant.id,
          email: participant.email,
          error: "Failed to download contact sheet from S3",
        };
      }
    } else {
      console.error(`❌ No contact sheet key for ${participant.reference}`);
      return {
        success: false,
        participantId: participant.id,
        email: participant.email,
        error: "No contact sheet available",
      };
    }

    // Create email HTML
    const participantName =
      `${participant.firstname} ${participant.lastname}`.trim() ||
      participant.email;

    const emailJsx = ContactSheetEmail({
      participantName: participantName,
      marathonName: marathonName,
      participantReference: participant.reference,
      replyToEmail: "info@stockholmfotomaraton.se",
      marathonLogoUrl:
        "https://www.stockholmfotomaraton.se/wp-content/uploads/2022/11/Logga-22-png-1024x1024-1.png",
    });

    // Send email via Resend - attachment is required
    if (!attachment) {
      console.error(
        `❌ No attachment available for ${participant.reference} - this should not happen`,
      );
      return {
        success: false,
        participantId: participant.id,
        email: participant.email,
        error: "No contact sheet attachment available",
      };
    }

    const emailData: CreateEmailOptions = {
      from:
        fromEmail ||
        process.env.FROM_EMAIL ||
        "Blikka App <noreply@blikka.app>",
      to: [participant.email, "villiam.strandh@outlook.com"],
      subject: `Your Contact Sheet from ${marathonName}`,
      attachments: [attachment],
      react: emailJsx,
      replyTo: "info@stockholmfotomaraton.se",
    };

    const resend = getResendClient();
    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error(
        `❌ Failed to send email to ${participant.email}:`,
        result.error,
      );
      return {
        success: false,
        participantId: participant.id,
        email: participant.email,
        error: result.error.message || "Unknown email error",
      };
    }

    console.log(
      `✅ Email sent successfully to ${participant.email} (ID: ${result.data?.id})`,
    );
    return {
      success: true,
      participantId: participant.id,
      email: participant.email,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `❌ Failed to send email to ${participant.email}:`,
      errorMessage,
    );
    return {
      success: false,
      participantId: participant.id,
      email: participant.email,
      error: errorMessage,
    };
  }
}

export async function sendTestContactSheetEmail(
  toEmail: string,
  marathonName: string = "Test Marathon 2024",
  fromEmail?: string,
): Promise<EmailResult> {
  try {
    console.log(`🧪 Sending test email to ${toEmail}`);

    // const emailHtml = createContactSheetEmailHtml(
    //   "Test Participant",
    //   marathonName,
    //   "TEST001"
    // )

    const emailJsx = ContactSheetEmail({
      participantName: "Test Participant",
      marathonName: marathonName,
      participantReference: "TEST001",
      replyToEmail: "info@stockholmfotomaraton.se",
      marathonLogoUrl:
        "https://www.stockholmfotomaraton.se/wp-content/uploads/2022/11/Logga-22-png-1024x1024-1.png",
    });

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: fromEmail || process.env.FROM_EMAIL || "noreply@blikka.app",
      to: [toEmail],
      subject: `[TEST] Your Contact Sheet from ${marathonName}`,
      react: emailJsx,
    });

    if (result.error) {
      console.error(
        `❌ Failed to send test email to ${toEmail}:`,
        result.error,
      );
      return {
        success: false,
        participantId: -1,
        email: toEmail,
        error: result.error.message || "Unknown email error",
      };
    }

    console.log(
      `✅ Test email sent successfully to ${toEmail} (ID: ${result.data?.id})`,
    );
    return {
      success: true,
      participantId: -1,
      email: toEmail,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Failed to send test email to ${toEmail}:`, errorMessage);
    return {
      success: false,
      participantId: -1,
      email: toEmail,
      error: errorMessage,
    };
  }
}
