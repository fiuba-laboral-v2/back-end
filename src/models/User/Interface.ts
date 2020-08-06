export interface IUser {
  uuid?: string;
  name: string;
  surname: string;
  email: string;
  dni?: number;
  password: string;
}

export interface IUserEditable {
  uuid?: string;
  name?: string;
  surname?: string;
}
