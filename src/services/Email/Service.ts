import { EmailApi } from "$services/Email/EmailApi";
import { ISendEmail } from "$services/Email/interface";
import "isomorphic-fetch";

export const EmailService = {
  send: (params: ISendEmail) => {
    return EmailApi.send(params);
  }
};
