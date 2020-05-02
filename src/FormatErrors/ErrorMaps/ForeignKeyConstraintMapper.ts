import { ForeignKeyConstraintError } from "sequelize";
import { IMapItem } from "./IMapItem";

const constraintTranslator = {
  Applicants_userUuid_fkey: "UserDoesNotExistError",
  Offers_companyUuid_fkey: "CompanyDoesNotExistError",
  CompanyPhotos_companyUuid_fkey: "CompanyDoesNotExistError",
  CompanyPhoneNumbers_companyUuid_fkey: "CompanyDoesNotExistError",
  OffersSections_offerUuid_fkey: "OfferDoesNotExistError",
  OffersCareers_offerUuid_fkey: "OfferDoesNotExistError",
  OffersCareers_careerCode_fkey: "CareerDoesNotExistError",
  JobApplications_offerUuid_fkey: "OfferDoesNotExistError",
  JobApplications_applicantUuid_fkey: "ApplicantDoesNotExistError",
  ApplicantsLinks_applicantUuid_fkey: "ApplicantDoesNotExistError",
  ApplicantsCapabilities_applicantUuid_fkey: "ApplicantDoesNotExistError",
  CareersApplicants_applicantUuid_fkey: "ApplicantDoesNotExistError",
  CareersApplicants_careerCode_fkey: "CareerDoesNotExistError",
  ApplicantsCapabilities_capabilityUuid_fkey: "CapabilitiesDoesNotExistError"
};

export const foreignKeyConstraintErrorMapper: IMapItem = {
  message: "ForeignKeyConstraintError",
  data: (error: ForeignKeyConstraintError) => ({
    errorType: constraintTranslator[error.index] || error.index
  })
};
