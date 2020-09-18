import { CompanyPermissions } from "$models/Permissions";

export class CompanyRole {
  public companyUuid: string;

  constructor(companyUuid: string) {
    this.companyUuid = companyUuid;
  }

  public getPermissions() {
    return new CompanyPermissions(this.companyUuid);
  }
}
