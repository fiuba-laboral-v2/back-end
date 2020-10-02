import { EmailApi } from "$services/Email/EmailApi";
import { EmailServiceConfig } from "$config";
import { ISendEmail } from "$services/Email/interface";

export const EmailService = {
  send: async (
    params: ISendEmail,
    retryIntervalsInSeconds: number[] = EmailServiceConfig.retryIntervalsInSeconds()
  ) => {
    try {
      await EmailApi.send(params);
    } catch (error) {
      const seconds = retryIntervalsInSeconds[0];
      const thereAreNoMoreRetries = seconds === undefined;
      if (thereAreNoMoreRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      return EmailService.send(params, retryIntervalsInSeconds.splice(1));
    }
  }
};
