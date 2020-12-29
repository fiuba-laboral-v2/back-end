import { Applicant } from "$models";
import { IPermission } from "../Interfaces";
import { ApprovalStatus } from "$models/ApprovalStatus";

export class ApprovedApplicantAdminPermission implements IPermission {
  private readonly applicant: Applicant;

  constructor(company: Applicant) {
    this.applicant = company;
  }

  public async apply() {
    return this.applicant.approvalStatus === ApprovalStatus.approved;
  }
}
