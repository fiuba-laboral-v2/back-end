interface ICurrentAdmin {
  userUuid: string;
}

export interface IAdminUser {
  uuid: string;
  email: string;
  admin: ICurrentAdmin;
  company?: undefined;
  applicant?: undefined;
}
