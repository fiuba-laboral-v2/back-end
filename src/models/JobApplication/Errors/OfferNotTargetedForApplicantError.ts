export class OfferNotTargetedForApplicantError extends Error {
  public static buildMessage(applicantUuid: string, offerUuid: string) {
    return `Applicant with uuid ${applicantUuid} cannot apply to offer with uuid ${offerUuid}`;
  }

  constructor(applicantUuid: string, offerUuid: string) {
    super(OfferNotTargetedForApplicantError.buildMessage(applicantUuid, offerUuid));
  }
}
