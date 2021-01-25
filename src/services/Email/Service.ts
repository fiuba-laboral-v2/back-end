import { EmailApi } from "$services/Email/EmailApi";
import { EmailServiceConfig } from "$config";
import { ISendEmail } from "$services/Email/interface";

export const EmailService = {
  send: async ({
    params,
    retryIntervalsInSeconds = EmailServiceConfig.retryIntervalsInSeconds(),
    onSuccess,
    onError
  }: ISend) => {
    try {
      await EmailApi.send(params);
      if (onSuccess) await onSuccess("The Email has been sent");
    } catch (error) {
      const seconds = retryIntervalsInSeconds[0];
      const thereAreNoMoreRetries = seconds === undefined;
      if (thereAreNoMoreRetries) {
        if (onError) await onError(`Could not send an email: ${error.message}`);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      return EmailService.send({
        params,
        retryIntervalsInSeconds: retryIntervalsInSeconds.splice(1),
        onSuccess,
        onError
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
