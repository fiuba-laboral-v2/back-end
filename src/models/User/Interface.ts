export interface IUser {
  uuid?: string;
  name: string;
  surname: string;
  email: string;
  dni?: string;
  password?: string;
}

export interface ICreateFiubaUser extends IUser {
  dni: string;
  password: string;
}

export interface IUserEditable {
  uuid?: string;
  email?: string;
  name?: string;
  surname?: string;
}

export interface ICredentials {
  authenticate: (password: string) => Promise<boolean>;
}
