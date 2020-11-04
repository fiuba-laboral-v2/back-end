import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const marcos = {
  user: {
    uuid: uuids.marcos.user,
    email: "marcos@mercadolibre.com",
    password: hashSync("SecurePassword1010", 10),
    name: "Mariano",
    surname: "Beiró",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  companyUser: {
    companyUuid: uuids.companies.mercadoLibre,
    userUuid: uuids.marcos.user,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
