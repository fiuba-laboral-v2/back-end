export class OfferNotVisibleByApplicantError extends Error {
  public static buildMessage() {
    return "offer is not visible by applicant";
  }

  constructor() {
    super(OfferNotVisibleByApplicantError.buildMessage());
  }
}
