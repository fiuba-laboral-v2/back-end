import { Notification } from "$models/Notification";
import { ISendEmail } from "$services/Email/interface";
import { NotificationEmailLog } from "$models";
import { EmailService } from "$services";
import { NotificationEmailLogRepository } from "$models/NotificationEmailLog";

export class NotificationEmailSender {
  private readonly notification: Notification;
  private readonly notificationTableName: string;
  private readonly emailParams: ISendEmail;

  constructor(notification: Notification, notificationTableName: string, emailParams: ISendEmail) {
    this.notification = notification;
    this.notificationTableName = notificationTableName;
    this.notificationTableName = notificationTableName;
    this.emailParams = emailParams;
  }

  public async send() {
    return EmailService.send({
      params: this.emailParams,
      onSuccess: message => this.createLog(true, message),
      onError: message => this.createLog(false, message)
    });
  }

  private async createLog(success: boolean, message: string) {
    const notificationEmailLog = new NotificationEmailLog({
      notificationUuid: this.notification.uuid,
      notificationTable: this.notificationTableName,
      success,
      message
    });
    await NotificationEmailLogRepository.save(notificationEmailLog);
  }
}
