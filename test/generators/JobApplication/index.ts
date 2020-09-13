import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin } from "$models";

export const JobApplicationGenerator = {
  instance: {
    withMinimumData: async () => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      return JobApplicationRepository.apply(applicant.uuid, offer);
    },
    updatedWithStatus: async ({ admin, status }: IUpdatedWithStatus) => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
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
