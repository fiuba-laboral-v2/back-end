import { ApplicantType } from "$models/Applicant";
import { Applicant, Offer } from "$models";
import { OfferTargetApplicantPermission } from "./OfferTargetApplicantPermission";
import { HasAppliedToOfferApplicantPermission } from "./HasAppliedToOfferApplicantPermission";
import { IApplicantPermission } from "./Interfaces";

export class ExpiredOfferApplicantPermission implements IApplicantPermission {
  private readonly offer: Offer;
  private readonly applicantType: ApplicantType;
  private readonly offerTargetPermission: OfferTargetApplicantPermission;
  private readonly hasAppliedToOfferPermission: HasAppliedToOfferApplicantPermission;

  constructor(applicant: Applicant, offer: Offer, applicantType: ApplicantType) {
    this.offer = offer;
    this.applicantType = applicantType;
    this.offerTargetPermission = new OfferTargetApplicantPermission(offer, applicantType);
    this.hasAppliedToOfferPermission = new HasAppliedToOfferApplicantPermission(applicant, offer);
  }

  public async apply() {
    if (!this.offerTargetPermission.apply()) return false;
    const isExpired = this.offer.isExpiredFor(this.applicantType);
    if (isExpired) return this.hasAppliedToOfferPermission.apply();
    return true;
  }
}
