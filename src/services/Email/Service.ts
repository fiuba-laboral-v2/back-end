import { EmailApi } from "$services/Email/EmailApi";
import { EmailServiceConfig } from "$config";
import { ISendEmail } from "$services/Email/interface";
import { Logger } from "$libs/Logger";

export const EmailService = {
  send: async ({
    params,
    retryIntervalsInSeconds = EmailServiceConfig.retryIntervalsInSeconds()
  }: ISend) => {
    try {
      await EmailApi.send(params);
      Logger.info("email sent");
    } catch (error) {
      const seconds = retryIntervalsInSeconds[0];
      const thereAreNoMoreRetries = seconds === undefined;
      if (thereAreNoMoreRetries) {
        Logger.error(`Could not send an email: ${error.message}`, error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      return EmailService.send({
        params,
        retryIntervalsInSeconds: retryIntervalsInSeconds.splice(1)
      });
    }
  }
};

interface ISend {
  params: ISendEmail;
  retryIntervalsInSeconds?: number[];
  onSuccess?: (message: string) => Promise<void>;
  onError?: (message: string) => Promise<void>;
}
