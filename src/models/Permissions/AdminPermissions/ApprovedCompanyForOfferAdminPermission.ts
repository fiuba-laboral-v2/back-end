import { Company } from "$models";
import { IPermission } from "../Interfaces";
import { ApprovalStatus } from "$models/ApprovalStatus";

export class ApprovedCompanyForOfferAdminPermission implements IPermission {
  private readonly company: Company;

  constructor(company: Company) {
    this.company = company;
  }

  public async apply() {
    return this.company.approvalStatus === ApprovalStatus.approved;
  }
}
