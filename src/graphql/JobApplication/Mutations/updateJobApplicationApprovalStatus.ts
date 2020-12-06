import { Database } from "$config/Database";
import { ID, nonNull } from "$graphql/fieldTypes";
import { AdminRepository } from "$models/Admin";
import { JobApplicationRepository } from "$models/JobApplication";
import { JobApplicationApprovalEventRepository } from "$models/JobApplication/JobApplicationsApprovalEvent";
import { JobApplicationApprovalEvent } from "$models";
import {
  JobApplicationNotificationFactory,
  NotificationRepositoryFactory
} from "$models/Notification";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { EmailSenderFactory } from "$models/EmailSenderFactory";
import { IApolloServerContext } from "$graphql/Context";

export const updateJobApplicationApprovalStatus = {
  type: GraphQLJobApplication,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    }
  },
  resolve: async (
    _: undefined,
    { uuid: jobApplicationUuid, approvalStatus }: IMutationVariables,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const jobApplication = await JobApplicationRepository.findByUuid(jobApplicationUuid);

    jobApplication.set({ approvalStatus });
    const notifications = await JobApplicationNotificationFactory.create(jobApplication, admin);
    const event = new JobApplicationApprovalEvent({
      adminUserUuid,
      jobApplicationUuid,
      status: approvalStatus
    });

    await Database.transaction(async transaction => {
      await JobApplicationRepository.save(jobApplication, transaction);
      await JobApplicationApprovalEventRepository.save(event, transaction);
      for (const notification of notifications) {
        const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
        await repository.save(notification, transaction);
      }
    });

    for (const notification of notifications) {
      const emailSender = EmailSenderFactory.create(notification);
      emailSender.send(notification);
    }

    return jobApplication;
  }
};

interface IMutationVariables {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
