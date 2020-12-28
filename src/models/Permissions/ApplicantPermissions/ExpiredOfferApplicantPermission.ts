import { ApplicantType } from "$models/Applicant";
import { JobApplicationRepository } from "$models/JobApplication";
import { Applicant, Offer } from "$models";
import { OfferTargetApplicantPermission } from "./OfferTargetApplicantPermission";
import { IApplicantPermission } from "./Interfaces";

export class ExpiredOfferApplicantPermission implements IApplicantPermission {
  private readonly applicant: Applicant;
  private readonly offer: Offer;
  private readonly applicantType: ApplicantType;
  private readonly offerTargetApplicantPermission: OfferTargetApplicantPermission;

  constructor(applicant: Applicant, offer: Offer, applicantType: ApplicantType) {
    this.applicant = applicant;
    this.offer = offer;
    this.applicantType = applicantType;
    this.offerTargetApplicantPermission = new OfferTargetApplicantPermission(offer, applicantType);
  }

  public async apply() {
    if (!this.offerTargetApplicantPermission.apply()) return false;
    const isExpired = this.offer.isExpiredFor(this.applicantType);
    if (isExpired) return JobApplicationRepository.hasApplied(this.applicant, this.offer);
    return true;
  }
}
