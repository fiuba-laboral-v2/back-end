import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";
import { IApplicantPermission } from "./Interfaces";

export class OfferTargetApplicantPermission implements IApplicantPermission {
  private readonly offer: Offer;
  private readonly applicantType: ApplicantType;

  constructor(offer: Offer, applicantType: ApplicantType) {
    this.offer = offer;
    this.applicantType = applicantType;
  }

  public apply() {
    const targetApplicantType = this.offer.targetApplicantType;
    if (this.applicantType === targetApplicantType) return true;
    return this.applicantType === ApplicantType.both || targetApplicantType === ApplicantType.both;
  }
}
