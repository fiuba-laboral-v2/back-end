import { Offer } from "$models";
import { IPermission } from "../Interface";
import { CurrentUser } from "$models/CurrentUser";

export class UserPermissions implements IPermission {
  private readonly permissions: IPermission[];

  constructor(currentUser: CurrentUser) {
    this.permissions = currentUser.roles.map(role => role.getPermissions());
  }

  public async canSeeOffer(offer: Offer) {
    return (
      await Promise.all(this.permissions.map(permission => permission.canSeeOffer(offer)))
    ).some(canSeeOffer => canSeeOffer);
  }
}
