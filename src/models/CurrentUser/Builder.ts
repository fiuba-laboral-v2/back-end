import { AdminRole, ApplicantRole, CompanyRole, IRole } from "$models/CurrentUser/Roles";
import { CurrentUser } from "$models/CurrentUser/Model";

export const CurrentUserBuilder = {
  build: ({ uuid, email, admin, applicant, company }: ICurrentUserTokenData) => {
    const roles: IRole[] = [];
    if (admin) roles.push(new AdminRole(admin.userUuid));
    if (company) roles.push(new CompanyRole(company.uuid));
    if (applicant) roles.push(new ApplicantRole(applicant.uuid));
    return new CurrentUser({ uuid, email, roles });
  }
};

export interface ICurrentUserTokenData {
  uuid: string;
  email: string;
  admin?: { userUuid: string };
  company?: { uuid: string };
  applicant?: { uuid: string };
}
