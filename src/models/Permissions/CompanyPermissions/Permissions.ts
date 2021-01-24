import { JobApplication, Offer } from "$models";
import { CompanyRepository } from "$models/Company";
import { CompanyWithNoInternshipAgreementError } from "$models/Offer";
import { IPermissions } from "../Interfaces";

export class CompanyPermissions implements IPermissions {
  private readonly companyUuid: string;

  constructor(companyUuid: string) {
    this.companyUuid = companyUuid;
  }

  public canSeeOffer(offer: Offer) {
    return Promise.resolve(offer.companyUuid === this.companyUuid);
  }

  public async canPublishInternship() {
    const company = await CompanyRepository.findByUuid(this.companyUuid);
    if (company.hasAnInternshipAgreement) return true;
    throw new CompanyWithNoInternshipAgreementError();
  }

  public async canModerateOffer(_: Offer) {
    return Promise.resolve(false);
  }

  public async canModerateJobApplication(_: JobApplication) {
    return Promise.resolve(false);
  }
}
