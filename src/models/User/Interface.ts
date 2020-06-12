export interface IUser {
  uuid?: string;
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface IUserEditable {
  uuid?: string;
  name?: string;
  surname?: string;
}
