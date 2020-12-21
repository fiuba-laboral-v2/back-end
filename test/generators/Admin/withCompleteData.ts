import { ISaveAdmin } from "$graphql/Admin/Mutations/saveAdmin";
import { Secretary } from "$models/Admin/Interface";
import { IUserGeneratorAttributes } from "$generators/interfaces";
import { DniGenerator } from "$generators/DNI";

export const withCompleteData = ({
  index,
  password,
  secretary
}: IAdminGeneratorAttributes): ISaveAdmin => ({
  user: {
    dni: DniGenerator.generate(),
    email: `${secretary}admin${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "adminName",
    surname: "adminSurname"
  },
  secretary
});

export interface IAdminGeneratorAttributes extends IUserGeneratorAttributes {
  index: number;
  secretary: Secretary;
}
