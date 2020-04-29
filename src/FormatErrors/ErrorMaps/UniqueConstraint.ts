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
  Careers_code_key: "CareerAlreadyExistsError"
};

export const uniqueConstraintErrorMapItem: IMapItem = {
  message: "UniqueConstraintError",
  data: (error: UniqueConstraintError) => ({
    errorType: constraintTranslator[error.original.constraint]
  })
};
