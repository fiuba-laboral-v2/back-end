import { ISaveAdmin } from "$models/Admin";
import { Secretary } from "$models/Admin/Interface";
import { IUserProps } from "$generators/interfaces";

export const withCompleteData = (
  {
    index,
    secretary,
    password
  }: IAdminData
): ISaveAdmin => ({
  user: {
    email: `${secretary}admin${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "adminName",
    surname: "adminSurname"
  },
  secretary
});

export interface IAdminData extends AdminInputData {
  index: number;
  secretary: Secretary;
}

export type AdminInputData = Omit<IUserProps, "expressContext">;
