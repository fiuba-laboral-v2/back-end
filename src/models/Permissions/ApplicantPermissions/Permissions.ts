import { Offer } from "$models";
import { ApplicantRepository } from "$models/Applicant";
import { IPermission } from "../Interface";
import { IApplicantPermission } from "./Interfaces";
import { OfferApprovalStatusApplicantPermission } from "./OfferApprovalStatusApplicantPermission";
import { OfferTargetApplicantPermission } from "./OfferTargetApplicantPermission";
import { ExpiredOfferApplicantPermission } from "./ExpiredOfferApplicantPermission";

export class ApplicantPermissions implements IPermission {
  private readonly applicantUuid: string;

  constructor(applicantUuid: string) {
    this.applicantUuid = applicantUuid;
  }

  public async canSeeOffer(offer: Offer) {
    const applicant = await ApplicantRepository.findByUuid(this.applicantUuid);
    const applicantType = await applicant.getType();
    const permissions: IApplicantPermission[] = [
      new OfferTargetApplicantPermission(offer, applicantType),
      new OfferApprovalStatusApplicantPermission(offer, applicantType),
      new ExpiredOfferApplicantPermission(applicant, offer, applicantType)
    ];
    const results = await Promise.all(permissions.map(permission => permission.apply()));
    return results.every(result => result);
  }

  public async canModerateOffer(_: Offer) {
    return Promise.resolve(false);
  }
}
