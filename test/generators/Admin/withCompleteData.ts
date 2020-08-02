import { ISaveAdmin } from "../../../src/models/Admin";
import { Secretary } from "../../../src/models/Admin/Interface";

export const withCompleteData = (index: number): ISaveAdmin => ({
  user: {
    email: `admin${index}@mail.com`,
    password: "ASDqfdsfsdfwe234",
    name: "adminName",
    surname: "adminSurname"
  },
  secretary: index % 2 === 0 ? Secretary.extension : Secretary.graduados
});
