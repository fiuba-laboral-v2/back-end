import { cuitGenerator } from "./cuitGenerator";

export const withMinimumData = (index: number) => {
  return {
    cuit: cuitGenerator(index),
    companyName: "companyName",
    user: {
      email: `company${index}@mail.com`,
      password: "ASDqfdsfsdfwe234",
      name: "companyUserName",
      surname: "companyUserSurname"
    }
  };
};
