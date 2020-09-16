import { Offer } from "$models";

export class CompanyPermissions {
  private readonly companyUuid: string;

  constructor(companyUuid: string) {
    this.companyUuid = companyUuid;
  }

  public canSeeOffer(offer: Offer) {
    return offer.companyUuid === this.companyUuid;
  }
}
