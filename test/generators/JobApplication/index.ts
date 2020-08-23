import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";

export const JobApplicationGenerator = {
  instance: async () => {
    const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
    return JobApplicationRepository.apply(applicantUuid, offer);
  }
};
