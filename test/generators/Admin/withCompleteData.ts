import { ISaveAdmin } from "../../../src/models/Admin";
import { Secretary } from "../../../src/models/Admin/Interface";

export const withCompleteData = (index: number, secretary: Secretary): ISaveAdmin => ({
  user: {
    email: `admin${index}@mail.com`,
    password: "ASDqfdsfsdfwe234",
    name: "adminName",
    surname: "adminSurname"
  },
  secretary
});
