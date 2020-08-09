import { ICompanyGeneratorAttributes } from "$generators/interfaces";
import { CuitGenerator } from "$generators/Cuit";

export const withMinimumData = (
  {
    index,
    user
  }: IWithMinimumData
) => ({
  cuit: CuitGenerator.generate(),
  companyName: "companyName",
  user: {
    email: `company${index}@mail.com`,
    password: user?.password || "ASDqfdsfsdfwe234",
    name: "companyUserName",
    surname: "companyUserSurname"
  }
});

interface IWithMinimumData extends ICompanyGeneratorAttributes {
  index: number;
}
