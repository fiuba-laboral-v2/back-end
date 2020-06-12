import { ISaveAdmin } from "../../../src/models/Admin";

export const withCompleteData = (index: number): ISaveAdmin => ({
  user: {
    email: `admin${index}@mail.com`,
    password: "ASDqfdsfsdfwe234",
    name: "adminName",
    surname: "adminSurname"
  }
});
