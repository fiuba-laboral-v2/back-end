import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { GraphQLStatistics } from "../Types/GraphQLStatistics";

export const getStatistics = {
  type: GraphQLStatistics,
  resolve: async () => ({
    amountOfStudents: await ApplicantRepository.countStudents(),
    amountOfGraduates: await ApplicantRepository.countGraduates(),
    amountOfCompanies: await CompanyRepository.countCompanies(),
    amountOfJobApplications: await JobApplicationRepository.countJobApplications(),
    amountOfOffers: await OfferRepository.countCurrentOffers()
  })
};
