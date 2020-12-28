import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";
import { OfferTargetApplicantPermission } from "./OfferTargetApplicantPermission";
import { IPermission } from "../Interfaces";

export class ExpiredOfferApplicantPermission implements IPermission {
  private readonly offer: Offer;
  private readonly applicantType: ApplicantType;
  private readonly offerTargetPermission: OfferTargetApplicantPermission;

  constructor(offer: Offer, applicantType: ApplicantType) {
    this.offer = offer;
    this.applicantType = applicantType;
    this.offerTargetPermission = new OfferTargetApplicantPermission(offer, applicantType);
  }

  public apply() {
    if (!this.offerTargetPermission.apply()) return false;
    const isExpired = this.offer.isExpiredFor(this.applicantType);
    return !isExpired;
  }
}
