import { CompanyUser } from "$models";

export class DeleteOnlyCompanyUserError extends Error {
  public static buildMessage(companyUser: CompanyUser) {
    return `Cannot delete the last company user from the company: ${companyUser.companyUuid}`;
  }

  constructor(companyUser: CompanyUser) {
    super(DeleteOnlyCompanyUserError.buildMessage(companyUser));
  }
}
