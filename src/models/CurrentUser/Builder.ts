import { AdminRole, ApplicantRole, CompanyRole, IRole } from "$models/CurrentUser/Roles";
import { CurrentUser } from "$models/CurrentUser/Model";

export const CurrentUserBuilder = {
  build: ({ uuid, admin, applicant, company }: ICurrentUserTokenData) => {
    const roles: IRole[] = [];
    if (admin) roles.push(new AdminRole(admin.userUuid));
    if (company) roles.push(new CompanyRole(company.uuid));
    if (applicant) roles.push(new ApplicantRole(applicant.uuid));
    return new CurrentUser({ uuid, roles });
  }
};

export interface ICurrentUserTokenData {
  uuid: string;
  admin?: { userUuid: string };
  company?: { uuid: string };
  applicant?: { uuid: string };
}
