export interface IUser {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface IUserEditable {
  name?: string;
  surname?: string;
}
