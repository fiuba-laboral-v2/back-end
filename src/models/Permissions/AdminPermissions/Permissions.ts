import { JobApplication, Offer } from "$models";
import { IPermissions, IPermission } from "../Interfaces";
import { OfferTargetAdminPermission } from "./OfferTargetAdminPermission";
import { ApprovedCompanyForOfferAdminPermission } from "./ApprovedCompanyForOfferAdminPermission";
import { ApprovedApplicantAdminPermission } from "./ApprovedApplicantAdminPermission";
import { ApplicantTargetAdminPermission } from "./ApplicantTargetAdminPermission";
import { AdminRepository } from "$models/Admin";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";

export class AdminPermissions implements IPermissions {
  private readonly adminUserUuid: string;

  constructor(adminUserUuid: string) {
    this.adminUserUuid = adminUserUuid;
  }

  public canSeeOffer(_: Offer) {
    return Promise.resolve(true);
  }

  public canPublishInternship() {
    return Promise.resolve(false);
  }

  public async canModerateOffer(offer: Offer) {
    const admin = await AdminRepository.findByUserUuid(this.adminUserUuid);
    const company = await CompanyRepository.findByUuid(offer.companyUuid);
    const permissions: IPermission[] = [
      new OfferTargetAdminPermission(offer, admin),
      new ApprovedCompanyForOfferAdminPermission(company)
    ];
    const results = await Promise.all(permissions.map(permission => permission.apply()));
    return results.every(result => result);
  }

  public async canModerateJobApplication(jobApplication: JobApplication) {
    const admin = await AdminRepository.findByUserUuid(this.adminUserUuid);
    const applicant = await ApplicantRepository.findByUuid(jobApplication.applicantUuid);
    const applicantType = await applicant.getType();

    const permissions: IPermission[] = [
      new ApprovedApplicantAdminPermission(applicant),
      new ApplicantTargetAdminPermission(admin, applicantType)
    ];
    const results = await Promise.all(permissions.map(permission => permission.apply()));
    return results.every(result => result);
  }
}
