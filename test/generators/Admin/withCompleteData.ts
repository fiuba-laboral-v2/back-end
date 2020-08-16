import { ISaveAdmin } from "$models/Admin";
import { Secretary } from "$models/Admin/Interface";
import { IUserGeneratorAttributes } from "$generators/interfaces";

export const withCompleteData = ({
  index,
  secretary,
  password,
}: IAdminGeneratorAttributes): ISaveAdmin => ({
  user: {
    email: `${secretary}admin${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "adminName",
    surname: "adminSurname",
  },
  secretary,
});

export interface IAdminGeneratorAttributes extends IUserGeneratorAttributes {
  index: number;
  secretary: Secretary;
}
