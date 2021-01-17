import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { GraphQLStatistics } from "../Types/GraphQLStatistics";

export const getStatistics = {
  type: GraphQLStatistics,
  resolve: async () => ({
    approvedStudentsCount: await ApplicantRepository.countStudents(),
    approvedGraduatesCount: await ApplicantRepository.countGraduates(),
    approvedCompaniesCount: await CompanyRepository.countCompanies(),
    approvedJobApplicationsCount: await JobApplicationRepository.countJobApplications(),
    approvedOffersCount: await OfferRepository.countCurrentOffers()
  })
};
