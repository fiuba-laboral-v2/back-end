import { ID, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import { ApprovalStatus } from "$models/ApprovalStatus";
import {
  ApplicantProfileNotificationFactory,
  NotificationRepositoryFactory
} from "$models/Notification";
import { EmailSenderFactory } from "$models/EmailSenderFactory";
import { ApplicantApprovalEvent } from "$models";

import { AdminRepository } from "$models/Admin";
import { ApplicantRepository } from "$models/Applicant";
import { ApplicantApprovalEventRepository } from "$models/Applicant/ApplicantApprovalEvent";

export const updateApplicantApprovalStatus = {
  type: GraphQLApplicant,
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
      uuid: applicantUuid,
      approvalStatus: status,
      moderatorMessage
    }: IUpdateApplicantApprovalStatusArguments,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);

    applicant.set({ approvalStatus: status });
    const event = new ApplicantApprovalEvent({ adminUserUuid, applicantUuid, status });
    const notifications = ApplicantProfileNotificationFactory.create(
      applicant,
      admin,
      moderatorMessage
    );

    await Database.transaction(async transaction => {
      await ApplicantRepository.save(applicant, transaction);
      await ApplicantApprovalEventRepository.save(event, transaction);
      for (const notification of notifications) {
        const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
        await repository.save(notification, transaction);
      }
    });

    for (const notification of notifications) {
      const emailSender = EmailSenderFactory.create(notification);
      emailSender.send(notification);
    }

    return applicant;
  }
};

interface IUpdateApplicantApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
  moderatorMessage?: string;
}
