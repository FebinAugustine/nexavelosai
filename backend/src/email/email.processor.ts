import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GmailService } from './gmail.service';
import { EmailHistoryService } from './email-history.service';
import { EmailCampaignsService } from './campaigns.service';
import { CampaignStatus } from './campaigns.schema';
import { EmailStatus } from './email-history.schema';

@Processor('email-queue')
export class EmailProcessor {
  constructor(
    private readonly gmailService: GmailService,
    private readonly emailHistoryService: EmailHistoryService,
    private readonly emailCampaignsService: EmailCampaignsService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job): Promise<void> {
    const { userId, to, subject, content, campaignId, googleAccountId } =
      job.data;

    try {
      console.log(`Sending email to ${to} for campaign ${campaignId}`);

      // Check if campaign is still running
      const campaign = await this.emailCampaignsService.getCampaign(
        userId,
        campaignId,
      );
      if (campaign.status !== CampaignStatus.RUNNING) {
        console.log(
          `Campaign ${campaignId} is not running, skipping email to ${to}`,
        );
        return;
      }

      const success = await this.gmailService.sendEmail(
        userId,
        to,
        subject,
        content,
        googleAccountId,
      );

      // Update email history
      await this.emailHistoryService.createEmailHistory({
        userId,
        campaignId,
        recipientEmail: to,
        subject,
        content,
        status: success ? EmailStatus.SENT : EmailStatus.FAILED,
        googleAccountId,
        sentAt: success ? new Date() : undefined,
        failedAt: !success ? new Date() : undefined,
      });

      // Update campaign stats
      if (campaignId) {
        await this.emailCampaignsService.updateCampaignStats(
          userId,
          campaignId,
          success,
        );
      }

      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);

      // Save failed email history
      await this.emailHistoryService.createEmailHistory({
        userId,
        campaignId,
        recipientEmail: to,
        subject,
        content,
        status: EmailStatus.FAILED,
        googleAccountId,
        failedAt: new Date(),
        errorMessage: error.message,
      });

      // Update campaign stats for failed email
      if (campaignId) {
        await this.emailCampaignsService.updateCampaignStats(
          userId,
          campaignId,
          false,
        );
      }

      throw error;
    }
  }
}
