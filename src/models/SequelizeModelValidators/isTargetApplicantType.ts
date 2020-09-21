import { targetApplicantTypeEnumValues } from "$models/Applicant/Interface";

export const isTargetApplicantType = {
  validate: {
    isIn: {
      msg: `ApplicantType must be one of these values: ${targetApplicantTypeEnumValues}`,
      args: [targetApplicantTypeEnumValues]
    }
  }
};
