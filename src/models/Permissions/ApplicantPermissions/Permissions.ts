import { JobApplication, Offer } from "$models";
import { ApplicantRepository } from "$models/Applicant";
import { IPermissions, IPermission } from "../Interfaces";
import { OfferApprovalStatusApplicantPermission } from "./OfferApprovalStatusApplicantPermission";
import { OfferTargetApplicantPermission } from "./OfferTargetApplicantPermission";
import { ExpiredOfferApplicantPermission } from "./ExpiredOfferApplicantPermission";
import { HasAppliedToOfferApplicantPermission } from "./HasAppliedToOfferApplicantPermission";

export class ApplicantPermissions implements IPermissions {
  private readonly applicantUuid: string;

  constructor(applicantUuid: string) {
    this.applicantUuid = applicantUuid;
  }

  public async canSeeOffer(offer: Offer) {
    const applicant = await ApplicantRepository.findByUuid(this.applicantUuid);
    const applicantType = await applicant.getType();
    const hasAppliedToOfferPermission = new HasAppliedToOfferApplicantPermission(applicant, offer);
    const permissions: IPermission[] = [
      new OfferTargetApplicantPermission(offer, applicantType),
      new OfferApprovalStatusApplicantPermission(offer, applicantType),
      new ExpiredOfferApplicantPermission(offer, applicantType)
    ];
    if (await hasAppliedToOfferPermission.apply()) return true;
    const results = await Promise.all(permissions.map(permission => permission.apply()));
    return results.every(result => result);
  }

  public async canModerateOffer(_: Offer) {
    return Promise.resolve(false);
  }

  public async canModerateJobApplication(_: JobApplication) {
    return Promise.resolve(false);
  }
}
