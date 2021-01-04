import { JobApplication, Offer } from "$models";
import { IPermissions } from "../Interfaces";

export class CompanyPermissions implements IPermissions {
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

  public async canModerateJobApplication(_: JobApplication) {
    return Promise.resolve(false);
  }
}
