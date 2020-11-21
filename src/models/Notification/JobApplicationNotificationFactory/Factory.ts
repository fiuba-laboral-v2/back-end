import { Admin, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { CompanyRepository } from "$models/Company";

export const JobApplicationNotificationFactory = {
  create: async (jobApplication: JobApplication, admin: Admin, _?: string) => {
    if (jobApplication.approvalStatus === ApprovalStatus.approved) {
      const company = await CompanyRepository.findByJobApplication(jobApplication);
      return [
        new CompanyNewJobApplicationNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid,
          jobApplicationUuid: jobApplication.uuid
        })
      ];
    }
    return [];
  }
};
