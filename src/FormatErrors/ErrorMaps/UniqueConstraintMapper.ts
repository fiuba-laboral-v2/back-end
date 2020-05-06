import { IMapItem } from "./IMapItem";

class UniqueConstraintError extends Error {
  public original: {
    constraint: string;
  };
}

const constraintTranslator = {
  Users_email_key: "UserEmailAlreadyExistsError",
  Companies_cuit_key: "CompanyCuitAlreadyExistsError",
  JobApplications_applicantUuid_offerUuid_key: "JobApplicationAlreadyExistsError",
  Careers_code_key: "CareerAlreadyExistsError",
  CareersApplicants_careerCode_applicantUuid_key: "CareerAlreadyExistsError",
  ApplicantsLinks_applicantUuid_url_key: "LinkAlreadyExistsError"
};

export const uniqueConstraintErrorMapper: IMapItem = {
  message: "UniqueConstraintError",
  data: (error: UniqueConstraintError) => ({
    errorType: constraintTranslator[error.original.constraint]
  })
};
