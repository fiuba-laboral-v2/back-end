import { Offer } from "$models";
import { ApplicantRepository, ApplicantType } from "$models/Applicant";
import { IPermission } from "../Interface";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { some } from "lodash";

export class ApplicantPermissions implements IPermission {
  private readonly applicantUuid: string;

  constructor(applicantUuid: string) {
    this.applicantUuid = applicantUuid;
  }

  public async canSeeOffer(offer: Offer) {
    const applicant = await ApplicantRepository.findByUuid(this.applicantUuid);
    const applicantType = await applicant.getType();
    if (!this.applicantTypeMatches(applicantType, offer.targetApplicantType)) return false;

    const statusColumns = this.getStatusColumns(applicantType);
    return some(statusColumns, columnName => offer[columnName] === ApprovalStatus.approved);
  }

  public async canModerateOffer(_: Offer) {
    return Promise.resolve(false);
  }

  private getStatusColumns(applicantType: ApplicantType) {
    return {
      [ApplicantType.student]: ["extensionApprovalStatus"],
      [ApplicantType.graduate]: ["graduadosApprovalStatus"],
      [ApplicantType.both]: ["graduadosApprovalStatus", "extensionApprovalStatus"]
    }[applicantType];
  }

  private applicantTypeMatches(type: ApplicantType, anotherType: ApplicantType) {
    if (type === anotherType) return true;
    return type === ApplicantType.both || anotherType === ApplicantType.both;
  }
}
