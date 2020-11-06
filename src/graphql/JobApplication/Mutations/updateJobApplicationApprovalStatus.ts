import { Database } from "$config/Database";
import { ID, nonNull } from "$graphql/fieldTypes";
import { CompanyUserRepository } from "$models/CompanyUser";
import { JobApplicationRepository } from "$models/JobApplication";
import { JobApplicationApprovalEventRepository } from "$models/JobApplication/JobApplicationsApprovalEvent";
import { JobApplicationApprovalEvent, Notification } from "$models";
import { NotificationRepository } from "$models/Notification";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
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
    const adminUserUuid = currentUser.getAdmin().adminUserUuid;
    const jobApplication = await JobApplicationRepository.findByUuid(jobApplicationUuid);
    jobApplication.set({ approvalStatus });
    const notifications: Notification[] = [];
    if (approvalStatus === ApprovalStatus.approved) {
      const { companyUuid } = await jobApplication.getOffer();
      const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
      companyUsers.map(({ userUuid }) => {
        notifications.push(new Notification({ userUuid, adminUserUuid, jobApplicationUuid }));
      });
    }
    const event = new JobApplicationApprovalEvent({
      adminUserUuid,
      jobApplicationUuid,
      status: approvalStatus
    });

    return Database.transaction(async transaction => {
      await JobApplicationRepository.save(jobApplication, transaction);
      await JobApplicationApprovalEventRepository.save(event, transaction);
      await Promise.all(
        notifications.map(notification => NotificationRepository.save(notification, transaction))
      );
      return jobApplication;
    });
  }
};

interface IMutationVariables {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
