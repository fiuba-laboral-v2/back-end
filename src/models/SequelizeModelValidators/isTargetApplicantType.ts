import { targetApplicantTypeEnumValues } from "$models/Offer/Interface";

export const isTargetApplicantType = {
  validate: {
    isIn: {
      msg: `ApplicantType must be one of these values: ${targetApplicantTypeEnumValues}`,
      args: [targetApplicantTypeEnumValues]
    }
  }
};
