import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";
import { some } from "lodash";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IPermission } from "../Interfaces";

export class OfferApprovalStatusApplicantPermission implements IPermission {
  private readonly offer: Offer;
  private readonly applicantType: ApplicantType;

  constructor(offer: Offer, applicantType: ApplicantType) {
    this.offer = offer;
    this.applicantType = applicantType;
  }

  public apply() {
    const approvalStatusProperties = {
      [ApplicantType.student]: ["extensionApprovalStatus"],
      [ApplicantType.graduate]: ["graduadosApprovalStatus"],
      [ApplicantType.both]: ["graduadosApprovalStatus", "extensionApprovalStatus"]
    }[this.applicantType];

    return some(
      approvalStatusProperties,
      columnName => this.offer[columnName] === ApprovalStatus.approved
    );
  }
}
