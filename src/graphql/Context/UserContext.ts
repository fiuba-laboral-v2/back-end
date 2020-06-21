export interface ICurrentUser {
  uuid: string;
  email: string;
}

export interface IUser extends ICurrentUser {
  admin?: undefined;
  applicant?: undefined;
  company?: undefined;
}
