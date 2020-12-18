import { ID, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import {
  CompanyProfileNotificationFactory,
  NotificationRepositoryFactory
} from "$models/Notification";
import { EmailSenderFactory } from "$models/EmailSenderFactory";
import { CompanyRepository } from "$models/Company";
import { AdminRepository } from "$models/Admin";
import { CompanyApprovalEventRepository } from "$models/Company/CompanyApprovalEvent";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyApprovalEvent } from "$models";

export const updateCompanyApprovalStatus = {
  type: GraphQLCompany,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    moderatorMessage: {
      type: String
    }
  },
  resolve: async (
    _: undefined,
    {
      uuid: companyUuid,
      approvalStatus: status,
      moderatorMessage
    }: IUpdateCompanyApprovalStatusArguments,
    { currentUser }: IApolloServerContext
  ) => {
    const userUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(userUuid);
    const company = await CompanyRepository.findByUuid(companyUuid);
    company.set({ approvalStatus: status });
    const event = new CompanyApprovalEvent({ userUuid, companyUuid, status, moderatorMessage });
    const notifications = CompanyProfileNotificationFactory.create(
      company,
      admin,
      moderatorMessage
    );

    await Database.transaction(async transaction => {
      await CompanyRepository.save(company, transaction);
      await CompanyApprovalEventRepository.save(event, transaction);
      for (const notification of notifications) {
        const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
        await repository.save(notification, transaction);
      }
    });

    for (const notification of notifications) {
      const emailSender = EmailSenderFactory.create(notification);
      emailSender.send(notification);
    }

    return company;
  }
};

interface IUpdateCompanyApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
  moderatorMessage?: string;
}
