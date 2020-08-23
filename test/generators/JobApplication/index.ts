import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin } from "$models";

export const JobApplicationGenerator = {
  instance: {
    recentlyApplied: async () => {
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      return JobApplicationRepository.apply(applicantUuid, offer);
    },
    updatedWithStatus: async ({ admin, status }: IUpdatedWithStatus) => {
      const { uuid } = await JobApplicationGenerator.instance.recentlyApplied();
      return JobApplicationRepository.updateApprovalStatus({
        uuid,
        admin,
        status
      });
    }
  }
};

interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}
