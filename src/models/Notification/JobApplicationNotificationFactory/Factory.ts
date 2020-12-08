import { Admin, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { ApprovedJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { Notification } from "$models/Notification";
import { OfferRepository } from "$models/Offer";

export const JobApplicationNotificationFactory = {
  create: async (jobApplication: JobApplication, admin: Admin): Promise<Notification[]> => {
    if (jobApplication.approvalStatus === ApprovalStatus.approved) {
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      return [
        new NewJobApplicationCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: companyUuid,
          jobApplicationUuid: jobApplication.uuid
        }),
        new ApprovedJobApplicationApplicantNotification({
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: jobApplication.applicantUuid,
          jobApplicationUuid: jobApplication.uuid
        })
      ];
    }
    return [];
  }
};
