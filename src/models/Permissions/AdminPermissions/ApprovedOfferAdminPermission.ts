import { Admin, Offer } from "$models";
import { IPermission } from "../Interfaces";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { some } from "lodash";
import { Secretary } from "$models/Admin";

export class ApprovedOfferAdminPermission implements IPermission {
  private readonly admin: Admin;
  private readonly offer: Offer;

  constructor(admin: Admin, offer: Offer) {
    this.offer = offer;
    this.admin = admin;
  }

  public apply() {
    const approvalStatusProperties = {
      [Secretary.extension]: ["extensionApprovalStatus"],
      [Secretary.graduados]: ["graduadosApprovalStatus"]
    }[this.admin.secretary];

    return some(
      approvalStatusProperties,
      columnName => this.offer[columnName] === ApprovalStatus.approved
    );
  }
}
