import { Environment } from "$config";
import { EmailApi } from "$services/Email/EmailApi";
import { ISendEmail } from "$services/Email/interface";
import "isomorphic-fetch";

export const EmailService = {
  send: (params: ISendEmail) => {
    if (Environment.isLocal()) return;
    return EmailApi.send(params);
  }
};
