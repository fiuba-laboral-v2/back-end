import { EmailApi } from "$services/Email/EmailApi";
import { EmailServiceConfig } from "$config";
import { ISendEmail } from "$services/Email/interface";

export const EmailService = {
  send: async (params: ISendEmail, remainingAttemptCount?: number) => {
    try {
      await EmailApi.send(params);
    } catch (error) {
      if (remainingAttemptCount === undefined) {
        remainingAttemptCount = EmailServiceConfig.retryCount() - 1;
      }
      if (remainingAttemptCount === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, EmailServiceConfig.timeoutForRetry()));
      return EmailService.send(params, remainingAttemptCount - 1);
    }
  }
};
