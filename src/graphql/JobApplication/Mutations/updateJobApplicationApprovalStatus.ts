import { Database } from "$config/Database";
import { ID, nonNull, String } from "$graphql/fieldTypes";
import { AdminRepository } from "$models/Admin";
import {
  JobApplicationRepository,
  AdminCannotModerateJobApplicationError
} from "$models/JobApplication";
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
    },
    moderatorMessage: {
      type: String
    }
  },
  resolve: async (
    _: undefined,
    { uuid: jobApplicationUuid, approvalStatus: status, moderatorMessage }: IMutationVariables,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const jobApplication = await JobApplicationRepository.findByUuid(jobApplicationUuid);
    const permissions = currentUser.getPermissions();
    const canModerateJobApplication = await permissions.canModerateJobApplication(jobApplication);
    if (!canModerateJobApplication) throw new AdminCannotModerateJobApplicationError(admin);

    jobApplication.set({ approvalStatus: status });
    const notifications = await JobApplicationNotificationFactory.create(
      jobApplication,
      admin,
      moderatorMessage
    );
    const event = new JobApplicationApprovalEvent({
      adminUserUuid,
      jobApplicationUuid,
      status,
      moderatorMessage
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
  moderatorMessage?: string;
}
