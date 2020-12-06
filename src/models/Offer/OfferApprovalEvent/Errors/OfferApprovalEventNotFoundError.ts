export class OfferApprovalEventNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `OfferApprovalEvent with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(OfferApprovalEventNotFoundError.buildMessage(uuid));
  }
}
