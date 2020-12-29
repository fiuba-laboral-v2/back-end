import { ApplicantType } from "$models/Applicant";
import { Admin, Offer } from "$models";
import { IPermission } from "../Interfaces";
import { Secretary } from "$models/Admin";

export class OfferTargetAdminPermission implements IPermission {
  private readonly offer: Offer;
  private readonly admin: Admin;

  constructor(offer: Offer, admin: Admin) {
    this.offer = offer;
    this.admin = admin;
  }

  public apply() {
    const targetApplicantType = this.offer.targetApplicantType;
    if (targetApplicantType === ApplicantType.both) return true;
    return (
      {
        [Secretary.graduados]: ApplicantType.graduate,
        [Secretary.extension]: ApplicantType.student
      }[this.admin.secretary] === targetApplicantType
    );
  }
}
