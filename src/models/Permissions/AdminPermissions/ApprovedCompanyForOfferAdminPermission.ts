import { Offer } from "$models";
import { CompanyRepository } from "$models/Company";
import { IPermission } from "../Interfaces";
import { ApprovalStatus } from "$models/ApprovalStatus";

export class ApprovedCompanyForOfferAdminPermission implements IPermission {
  private readonly offer: Offer;

  constructor(offer: Offer) {
    this.offer = offer;
  }

  public async apply() {
    const company = await CompanyRepository.findByUuid(this.offer.companyUuid);
    return company.approvalStatus === ApprovalStatus.approved;
  }
}
