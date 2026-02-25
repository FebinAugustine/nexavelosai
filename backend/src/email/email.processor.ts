import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GmailService } from './gmail.service';
import { EmailHistoryService } from './email-history.service';
import { EmailCampaignsService } from './campaigns.service';
import { CampaignStatus } from './campaigns.schema';
import { EmailStatus } from './email-history.schema';
import { EventsGateway } from '../events/events.gateway';

@Processor('email-queue')
export class EmailProcessor {
  constructor(
    private readonly gmailService: GmailService,
    private readonly emailHistoryService: EmailHistoryService,
    private readonly emailCampaignsService: EmailCampaignsService,
    private readonly eventsGateway: EventsGateway,
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

      await this.gmailService.sendEmail(
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
        status: EmailStatus.SENT,
        googleAccountId,
        sentAt: new Date(),
      });

      // Update campaign stats
      if (campaignId) {
        await this.emailCampaignsService.updateCampaignStats(campaignId);
        // Get updated campaign and emit real-time update
        const updatedCampaign = await this.emailCampaignsService.getCampaign(
          userId,
          campaignId,
        );
        this.eventsGateway.sendCampaignUpdate(userId, updatedCampaign);
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
        await this.emailCampaignsService.updateCampaignStats(campaignId);
        // Get updated campaign and emit real-time update
        const updatedCampaign = await this.emailCampaignsService.getCampaign(
          userId,
          campaignId,
        );
        this.eventsGateway.sendCampaignUpdate(userId, updatedCampaign);
      }

      // Don't rethrow to prevent job from being retried infinitely
    }
  }
}
