import { JobApplicationRepository } from "$models/JobApplication";
import { Applicant, Offer } from "$models";
import { IPermission } from "../Interfaces";
import { ApprovalStatus } from "$models/ApprovalStatus";

export class HasAppliedToOfferApplicantPermission implements IPermission {
  private readonly applicant: Applicant;
  private readonly offer: Offer;

  constructor(applicant: Applicant, offer: Offer) {
    this.applicant = applicant;
    this.offer = offer;
  }

  public async apply() {
    const { findByApplicantAndOffer } = JobApplicationRepository;
    try {
      const jobApplication = await findByApplicantAndOffer(this.applicant, this.offer);
      return jobApplication.approvalStatus !== ApprovalStatus.rejected;
    } catch (error) {
      return false;
    }
  }
}
