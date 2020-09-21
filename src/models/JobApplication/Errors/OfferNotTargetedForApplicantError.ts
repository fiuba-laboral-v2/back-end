export class OfferNotTargetedForApplicantError extends Error {
  public static buildMessage() {
    return `The current applicant cannot apply to offer `;
  }

  constructor() {
    super(OfferNotTargetedForApplicantError.buildMessage());
  }
}
