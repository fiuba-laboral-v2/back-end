import { targetApplicantTypeEnumValues } from "$models/Offer/Interface";

export const isTargetApplicantType = {
  validate: {
    isIn: {
      msg: `TargetApplicantType must be one of these values: ${targetApplicantTypeEnumValues}`,
      args: [targetApplicantTypeEnumValues]
    }
  }
};
