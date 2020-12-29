import { Offer } from "$models";
import { IPermissions } from "../Interfaces";
import { CurrentUser } from "$models/CurrentUser";
import { some } from "lodash";

export class UserPermissions implements IPermissions {
  private readonly permissions: IPermissions[];

  constructor(currentUser: CurrentUser) {
    this.permissions = currentUser.roles.map(role => role.getPermissions());
  }

  public async canSeeOffer(offer: Offer) {
    return this.hasPermission(permission => permission.canSeeOffer(offer));
  }

  public async canModerateOffer(offer: Offer) {
    return this.hasPermission(permission => permission.canModerateOffer(offer));
  }

  private async hasPermission(callback: (permission: IPermissions) => Promise<boolean>) {
    return some(await Promise.all(this.permissions.map(callback)));
  }
}
