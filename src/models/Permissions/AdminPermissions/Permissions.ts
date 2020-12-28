import { Offer } from "$models";
import { IPermissions, IPermission } from "../Interfaces";
import { OfferTargetAdminPermission } from "./OfferTargetAdminPermission";
import { ApprovedCompanyForOfferAdminPermission } from "./ApprovedCompanyForOfferAdminPermission";
import { AdminRepository } from "$models/Admin";

export class AdminPermissions implements IPermissions {
  private readonly adminUserUuid: string;

  constructor(adminUserUuid: string) {
    this.adminUserUuid = adminUserUuid;
  }

  public canSeeOffer(_: Offer) {
    return Promise.resolve(true);
  }

  public async canModerateOffer(offer: Offer) {
    const admin = await AdminRepository.findByUserUuid(this.adminUserUuid);
    const permissions: IPermission[] = [
      new OfferTargetAdminPermission(offer, admin),
      new ApprovedCompanyForOfferAdminPermission(offer)
    ];
    const results = await Promise.all(permissions.map(permission => permission.apply()));
    return results.every(result => result);
  }
}
