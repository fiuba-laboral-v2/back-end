interface IEmailSender {
  name: string;
  email: string;
}

export interface ISendEmail {
  sender: IEmailSender;
  receiverEmails: string[];
  subject: string;
  body: string;
}
