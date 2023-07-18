import { HtmlTemplateManager } from '@utils/pdf/html-template-utils';
import { emailServiceError } from '@modules/email/email.error';
import { ISendEmailRequestDto } from '@modules/email/dtos/base.dto';
import * as sqsClient from '../../lib/sqs.client';
import { EventSource } from '@prisma/client';

export class EmailService {
  public static async sendEmail(
    recipient: string,
    subject: string,
    inputData: {},
    templateName: string
    // eslint-disable-next-line
  ): Promise<any> {
    try {
      // this does not send emails, it just queues them to the message gen consumer
      const templateGenerated = await HtmlTemplateManager.generateTemplate(
        inputData,
        templateName
      );
      await sqsClient.publishMessageSQS({
        default: 'group:Email',
        eventSource: EventSource.SystemGenerated,
        group: 'Email',
        type: 'Email',
        data: [
          {
            recipient,
            subject,
            body: templateGenerated,
          },
        ],
      });
      return { status: 200, message: 'Success' };
      // eslint-disable-next-line
    } catch (error: any) {
      if ('message' in error) {
        throw error.message;
      } else {
        throw error;
      }
    }
  }

  public static async sendPlainEmail(
    request: ISendEmailRequestDto
  ): Promise<any> {
    const { recipient, subject, body } = request;
    try {
      await sqsClient.publishMessageSQS({
        default: 'group:Email',
        eventSource: EventSource.SystemGenerated,
        group: 'Email',
        type: 'Email',
        data: [
          {
            recipient,
            subject,
            body,
          },
        ],
      });
      return { status: 200, message: 'Success' };
    } catch (error) {
      // The external service will probably set string error message
      throw emailServiceError(error as unknown as string);
    }
  }
}
