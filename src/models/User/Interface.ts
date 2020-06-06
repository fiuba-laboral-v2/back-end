export interface IUser {
  uuid?: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface IUserEditable {
  uuid?: string;
  name?: string;
  surname?: string;
}
