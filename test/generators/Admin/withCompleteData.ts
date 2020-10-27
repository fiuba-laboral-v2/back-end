import { ISaveAdmin } from "$models/Admin";
import { Secretary } from "$models/Admin/Interface";
import { IUserGeneratorAttributes } from "$generators/interfaces";
import { DniGenerator } from "$generators/DNI";

export const withCompleteData = ({ index, secretary }: IAdminGeneratorAttributes): ISaveAdmin => ({
  user: {
    dni: DniGenerator.generate(),
    email: `${secretary}admin${index}@mail.com`,
    name: "adminName",
    surname: "adminSurname"
  },
  secretary
});

export interface IAdminGeneratorAttributes extends IUserGeneratorAttributes {
  index: number;
  secretary: Secretary;
}
