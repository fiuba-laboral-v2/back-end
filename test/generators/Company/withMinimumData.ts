import { cuitGenerator } from "./cuitGenerator";
import { ICompanyAttributes } from "$generators/interfaces";

export const withMinimumData = (
  {
    index,
    user
  }: IWithMinimumData
) => ({
  cuit: cuitGenerator(index),
  companyName: "companyName",
  user: {
    email: `company${index}@mail.com`,
    password: user?.password || "ASDqfdsfsdfwe234",
    name: "companyUserName",
    surname: "companyUserSurname"
  }
});

interface IWithMinimumData extends WithMinimumInputData {
  index: number;
}

export type WithMinimumInputData = Omit<ICompanyAttributes, "expressContext" | "status" | "photos">;
