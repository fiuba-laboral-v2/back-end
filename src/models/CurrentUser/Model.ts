import { ICurrentUser } from "$graphql/Context";
import { AdminPermissions, ApplicantPermissions, CompanyPermissions } from "$models/Permissions";

export class CurrentUser {
  private attributes: ICurrentUser;

  constructor(attributes: ICurrentUser) {
    this.attributes = attributes;
  }

  public getPermissions() {
    if (this.attributes.admin) return new AdminPermissions();
    if (this.attributes.applicant) return new ApplicantPermissions(this.attributes.applicant.uuid);
    if (this.attributes.company) return new CompanyPermissions(this.attributes.company.uuid);
    throw new Error("the user should be an applicant, admin or from a company");
  }
}
