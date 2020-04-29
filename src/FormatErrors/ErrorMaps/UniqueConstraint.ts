import { IMapItem } from "./IMapItem";

class ConstraintError extends Error {
  public original: {
    constraint: string;
  };
}

const constraintTranslator = {
  Users_email_key: "UserEmailAlreadyExistsError",
  Companies_cuit_key: "CompanyCuitAlreadyExistsError",
  JobApplications_applicantUuid_offerUuid_key: "JobApplicationAlreadyExistsError",
  Careers_code_key: "CareerAlreadyExistsError"
};

export const uniqueConstraint: IMapItem = {
  message: "UniqueConstraintError",
  data: (error: ConstraintError) => ({
    errorType: constraintTranslator[error.original.constraint]
  })
};
