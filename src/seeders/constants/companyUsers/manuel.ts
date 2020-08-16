import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const manuel = {
  user: {
    uuid: uuids.manuel.user,
    email: "mllauro@devartis.com",
    password: hashSync("SecurePassword1010", 10),
    name: "Manuel",
    surname: "Llauró",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  companyUser: {
    companyUuid: uuids.companies.devartis,
    userUuid: uuids.manuel.user,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
