import { IMapItem } from "./IMapItem";

class ConstrainError extends Error {
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

const mapItem: IMapItem = {
  message: "UniqueConstraintError",
  data: (error: ConstrainError) => ({
    errorType: constraintTranslator[error.original.constraint]
  })
};

export const uniqueConstraint = {
  SequelizeUniqueConstraintError: mapItem
};
