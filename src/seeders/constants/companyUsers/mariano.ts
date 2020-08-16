import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const mariano = {
  user: {
    uuid: uuids.mariano.user,
    email: "mbeiro@mercadolibre.com",
    password: hashSync("SecurePassword1010", 10),
    name: "Mariano",
    surname: "Beiró",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  companyUser: {
    companyUuid: uuids.companies.mercadoLibre,
    userUuid: uuids.mariano.user,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
