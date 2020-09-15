import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const extensionAdmin = {
  user: {
    uuid: uuids.admin.user,
    email: "extension@admin.com",
    password: hashSync("SecurePassword1010", 10),
    name: "extension",
    surname: "secretary",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  admin: {
    userUuid: uuids.admin.user,
    secretary: "extension",
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
