import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const extensionAdmin = {
  user: {
    uuid: uuids.extensionAdmin.user,
    email: "extension@admin.com",
    password: hashSync("SecurePassword1010", 10),
    name: "extension",
    surname: "secretary",
    dni: "33333333",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  admin: {
    userUuid: uuids.extensionAdmin.user,
    secretary: "extension",
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
