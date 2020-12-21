import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const marcos = {
  user: {
    uuid: uuids.marcos.user,
    email: "sebastian.e.blanco@gmail.com",
    password: hashSync("SecurePassword1010", 10),
    name: "Marcos",
    surname: "Galperín",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  companyUser: {
    uuid: uuids.marcos.user,
    companyUuid: uuids.companies.mercadoLibre.uuid,
    userUuid: uuids.marcos.user,
    role: "CEO",
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
