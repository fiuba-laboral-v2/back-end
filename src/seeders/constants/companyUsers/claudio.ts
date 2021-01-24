import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const claudio = {
  user: {
    uuid: uuids.claudio.user,
    email: "fiubalaboralv2@gmail.com",
    password: hashSync("SecurePassword1010", 10),
    name: "Claudio",
    surname: "Acciaresi",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  companyUser: {
    uuid: uuids.claudio.companyUser,
    companyUuid: uuids.companies.devartis.uuid,
    userUuid: uuids.claudio.user,
    position: "Socio",
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
