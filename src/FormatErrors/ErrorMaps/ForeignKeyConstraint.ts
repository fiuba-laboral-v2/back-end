import { ForeignKeyConstraintError } from "sequelize";
import { IMapItem } from "./IMapItem";

const constraintTranslator = {
  Applicants_userUuid_fkey: "UserDoesNotExistError",
  Offers_companyId_fkey: "CompanyDoesNotExistError",
  CompanyPhotos_companyId_fkey: "CompanyDoesNotExistError",
  CompanyPhoneNumbers_companyId_fkey: "CompanyDoesNotExistError",
  OffersSections_offerUuid_fkey: "OfferDoesNotExist",
  OffersCareers_offerUuid_fkey: "OfferDoesNotExist",
  OffersCareers_careerCode_fkey: "CareerDoesNotExist",
  JobApplications_offerUuid_fkey: "OfferDoesNotExist",
  JobApplications_applicantUuid_fkey: "ApplicantDoesNotExist",
  ApplicantsLinks_applicantUuid_fkey: "ApplicantDoesNotExist",
  ApplicantsCapabilities_applicantUuid_fkey: "ApplicantDoesNotExist",
  CareersApplicants_applicantUuid_fkey: "ApplicantDoesNotExist",
  CareersApplicants_careerCode_fkey: "CareerDoesNotExist",
  ApplicantsCapabilities_capabilityUuid_fkey: "CapabilitiesDoesNotExist"
};

const mapItem: IMapItem = {
  message: "ForeignKeyConstraintError",
  data: (error: ForeignKeyConstraintError) => ({
    errorType: constraintTranslator[error.index]
  })
};

export const foreignKeyConstraint = {
  SequelizeForeignKeyConstraintError: mapItem
};
