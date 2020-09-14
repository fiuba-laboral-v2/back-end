import { ApplicantType } from "$models/Offer";

export class OfferNotTargetedForApplicantError extends Error {
  public static buildMessage(applicantType: ApplicantType, targetApplicantType: ApplicantType) {
    return `A ${applicantType} cannot apply to offer for ${targetApplicantType}`;
  }

  constructor(applicantType: ApplicantType, targetApplicantType: ApplicantType) {
    super(OfferNotTargetedForApplicantError.buildMessage(applicantType, targetApplicantType));
  }
}
