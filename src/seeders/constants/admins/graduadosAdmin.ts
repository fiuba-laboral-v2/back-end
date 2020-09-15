import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const graduadosAdmin = {
  user: {
    uuid: uuids.graduadosAdmin.user,
    email: "graduados@admin.com",
    password: hashSync("SecurePassword1010", 10),
    name: "graduados",
    surname: "secretary",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  admin: {
    userUuid: uuids.graduadosAdmin.user,
    secretary: "graduados",
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
