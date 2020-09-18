import { CompanyPermissions } from "$models/Permissions";
import { IRole } from "../Interface";

export class CompanyRole implements IRole {
  public companyUuid: string;

  constructor(companyUuid: string) {
    this.companyUuid = companyUuid;
  }

  public getPermissions() {
    return new CompanyPermissions(this.companyUuid);
  }
}
