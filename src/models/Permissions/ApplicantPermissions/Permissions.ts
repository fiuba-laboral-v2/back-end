import { Offer } from "$models";
import { ApplicantRepository } from "$models/Applicant";
import { ApplicantType } from "$models/Offer";
import { IPermission } from "../Interface";

export class ApplicantPermissions implements IPermission {
  private readonly applicantUuid: string;

  constructor(applicantUuid: string) {
    this.applicantUuid = applicantUuid;
  }

  public async canSeeOffer(offer: Offer) {
    const applicant = await ApplicantRepository.findByUuid(this.applicantUuid);
    if (offer.targetApplicantType === ApplicantType.both) return true;

    const applicantType = await applicant.getType();
    if (applicantType === ApplicantType.both) return true;
    return offer.targetApplicantType === applicantType;
  }
}
