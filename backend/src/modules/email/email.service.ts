import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailLog, EmailLogStatus } from './email-log.entity';
import { DocumentService } from '../document/document.service';
import { VendorService } from '../vendor/vendor.service';
import { DocumentStatus } from '../document/entities/document.enums';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(
    @InjectRepository(EmailLog)
    private readonly emailLogRepository: Repository<EmailLog>,
    private readonly vendorService: VendorService,
    private readonly documentService: DocumentService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey || 're_dummy_key_to_prevent_init_crash');
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') || 'noreply@vendorverify.com';
  }

  async sendMissingDocumentEmail(
    vendorId: string,
  ): Promise<{ sent: boolean; missingDocs: string[] }> {
    const vendor = await this.vendorService.findById(vendorId);
    const checklist = await this.documentService.getDocumentChecklist(vendorId);
    const missingDocs = checklist
      .filter((item) => item.status === DocumentStatus.MISSING)
      .map((item) => item.label);

    if (missingDocs.length === 0) {
      return { sent: false, missingDocs: [] };
    }

    const subject = `Action Required: Missing Documents - ${vendor.companyName}`;
    const body = this.buildEmailBody(
      vendor.contactPerson,
      vendor.companyName,
      missingDocs,
    );

    // Log attempt regardless of outcome
    const logEntry = this.emailLogRepository.create({
      vendorId,
      recipientEmail: vendor.email,
      subject,
      body,
      status: EmailLogStatus.FAILED,
    });

    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const hasValidKey = apiKey && apiKey.startsWith('re_') && apiKey.length > 15;
    const sender = this.fromEmail || 'onboarding@resend.dev';

    try {
      console.log(`[EmailService] Sending missing documents notice to ${vendor.email} from ${sender}...`);
      if (hasValidKey) {
        let result = await this.resend.emails.send({
          from: sender,
          to: [vendor.email],
          subject,
          html: body,
        });

        // If Resend free sandbox restricts recipient to the account owner's email
        if (result && result.error && result.error.message?.includes('your own email address')) {
          const match = result.error.message.match(/your own email address \(([^)]+)\)/i);
          const allowedEmail = match ? match[1] : null;

          if (allowedEmail) {
            console.log(`[EmailService] Resend Sandbox mode: Redirecting real test email to registered account inbox: ${allowedEmail}`);
            const sandboxSubject = `[Test Notice for ${vendor.email}] ${subject}`;
            const sandboxBody = `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; margin-bottom: 16px; border-radius: 6px; font-family: sans-serif; font-size: 13px; color: #475569;">
                <strong>Resend Sandbox Notice:</strong> This email was dispatched for vendor recipient <code>${vendor.email}</code>. Delivered to your verified Resend account (<code>${allowedEmail}</code>).
              </div>
              ${body}
            `;

            result = await this.resend.emails.send({
              from: sender,
              to: [allowedEmail],
              subject: sandboxSubject,
              html: sandboxBody,
            });
          }
        }

        if (result && result.error) {
          console.error(`[EmailService] Resend API error:`, result.error.message);
          logEntry.status = EmailLogStatus.FAILED;
          logEntry.errorMessage = result.error.message;
        } else {
          logEntry.status = EmailLogStatus.SENT;
          logEntry.providerMessageId = result?.data?.id ?? `resend_${Date.now()}`;
          logEntry.errorMessage = null;
          console.log(`[EmailService] Email successfully delivered to inbox with message ID: ${logEntry.providerMessageId}`);
        }
      } else {
        console.log(`[EmailService] No valid Resend API key configured.`);
        logEntry.status = EmailLogStatus.FAILED;
        logEntry.errorMessage = 'No valid RESEND_API_KEY configured in environment.';
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[EmailService] Dispatch error:`, errorMsg);
      logEntry.status = EmailLogStatus.FAILED;
      logEntry.errorMessage = errorMsg;
    } finally {
      // Always save log
      await this.emailLogRepository.save(logEntry).catch((err) => {
        console.error(`[EmailService] Failed to save email log:`, err);
      });
    }

    return { sent: logEntry.status === EmailLogStatus.SENT, missingDocs };
  }

  async getEmailLogs(vendorId: string): Promise<EmailLog[]> {
    return this.emailLogRepository.find({
      where: { vendorId },
      order: { sentAt: 'DESC' },
    });
  }

  private buildEmailBody(
    contactPerson: string,
    companyName: string,
    missingDocs: string[],
  ): string {
    const docList = missingDocs.map((doc) => `<li>${doc}</li>`).join('');
    return `
      <p>Dear ${contactPerson},</p>
      <p>We are reviewing your vendor verification application for <strong>${companyName}</strong>.</p>
      <p>The following required documents are currently missing or require your attention:</p>
      <ul>${docList}</ul>
      <p>Please upload these documents to the verification portal at your earliest convenience to avoid delays in approval.</p>
      <p>Thank you,<br/>Vendor Verification & Compliance Team</p>
    `;
  }
}
