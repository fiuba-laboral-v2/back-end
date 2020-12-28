import { JobApplicationRepository } from "$models/JobApplication";
import { Applicant, Offer } from "$models";
import { IApplicantPermission } from "./Interfaces";

export class HasAppliedToOfferApplicantPermission implements IApplicantPermission {
  private readonly applicant: Applicant;
  private readonly offer: Offer;

  constructor(applicant: Applicant, offer: Offer) {
    this.applicant = applicant;
    this.offer = offer;
  }

  public apply() {
    return JobApplicationRepository.hasApplied(this.applicant, this.offer);
  }
}
