import { IMapItem } from "./IMapItem";

class UniqueConstraintError extends Error {
  public original: {
    constraint: string;
  };
}

const constraintTranslator = {
  Users_email_unique: "UserEmailAlreadyExistsError",
  Companies_cuit_unique: "CompanyCuitAlreadyExistsError",
  JobApplications_applicantUuid_offerUuid_unique: "JobApplicationAlreadyExistsError",
  Careers_code_key: "CareerAlreadyExistsError",
  ApplicantCareers_applicantUuid_careerCode_key: "CareerAlreadyExistsError",
  ApplicantsLinks_applicantUuid_url_unique: "LinkAlreadyExistsError",
  Admins_userUuid_key: "AdminAlreadyExistsError",
  CompanyPhoneNumbers_phoneNumber_companyUuid_key: "DuplicatePhoneNumberError",
  Companies_businessName_unique: "BusinessNameAlreadyExistsError",
  Applicants_userUuid_unique: "ApplicantAlreadyExistsError"
};

export const uniqueConstraintErrorMapper: IMapItem = {
  message: "UniqueConstraintError",
  data: (error: UniqueConstraintError) => ({
    errorType: constraintTranslator[error.original.constraint]
  })
};
