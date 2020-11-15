import { Boolean, List, nonNull, String } from "$graphql/fieldTypes";
import { EmailService } from "$services";

export const sendEmail = {
  type: Boolean,
  args: {
    name: {
      type: nonNull(String)
    },
    email: {
      type: nonNull(String)
    },
    receiverEmails: {
      type: nonNull(List(nonNull(String)))
    },
    subject: {
      type: nonNull(String)
    },
    body: {
      type: nonNull(String)
    }
  },
  resolve: async (_, params: ISendEmail) => {
    await EmailService.send({
      sender: {
        name: params.name,
        email: params.email
      },
      ...params
    });
    return true;
  }
};

interface ISendEmail {
  name: string;
  email: string;
  receiverEmails: string[];
  subject: string;
  body: string;
}
