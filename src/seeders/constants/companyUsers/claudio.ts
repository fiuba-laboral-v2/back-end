import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const claudio = {
  user: {
    uuid: uuids.claudio.user,
    email: "claudio@devartis.com",
    password: hashSync("SecurePassword1010", 10),
    name: "Claudio",
    surname: "Acciaresi",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  companyUser: {
    companyUuid: uuids.companies.devartis,
    userUuid: uuids.claudio.user,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
