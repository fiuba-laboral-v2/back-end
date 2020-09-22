import { Admin, Offer } from "$models";

export class AdminCannotModerateOfferError extends Error {
  public static buildMessage({ secretary }: Admin, { targetApplicantType }: Offer) {
    return `admin from ${secretary} secretary cannot moderate offer targeted to ${targetApplicantType}`;
  }

  constructor(admin: Admin, offer: Offer) {
    super(AdminCannotModerateOfferError.buildMessage(admin, offer));
  }
}
