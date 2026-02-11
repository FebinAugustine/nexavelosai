import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GmailService } from './gmail.service';

@Processor('email-queue')
export class EmailProcessor {
  constructor(private readonly gmailService: GmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job): Promise<void> {
    const { userId, to, subject, content } = job.data;

    try {
      await this.gmailService.sendEmail(userId, to, subject, content);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
