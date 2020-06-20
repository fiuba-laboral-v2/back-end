export interface ICurrentUser {
  uuid: string;
  email: string;
}

export interface IUser extends ICurrentUser {
  admin?: undefined;
  company?: undefined;
  applicant?: undefined;
}
