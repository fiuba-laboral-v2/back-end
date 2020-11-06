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
      return JobApplicationRepository.apply(applicant, offer);
    },
    updatedWithStatus: async ({ status }: IUpdatedWithStatus) => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      jobApplication.set({ approvalStatus: status });
      return JobApplicationRepository.save(jobApplication);
    },
    toTheCompany: async (companyUuid: string) => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      return JobApplicationRepository.apply(applicant, offer);
    }
  }
};

interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}
