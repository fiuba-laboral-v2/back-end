import { Offer } from "$models";
import { IPermission } from "../Interface";

export class CompanyPermissions implements IPermission {
  private readonly companyUuid: string;

  constructor(companyUuid: string) {
    this.companyUuid = companyUuid;
  }

  public canSeeOffer(offer: Offer) {
    return Promise.resolve(offer.companyUuid === this.companyUuid);
  }

  public async canModerateOffer(_: Offer) {
    return Promise.resolve(false);
  }
}
