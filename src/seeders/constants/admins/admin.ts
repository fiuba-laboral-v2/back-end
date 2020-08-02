import { uuids } from "../uuids";
import { hashSync } from "bcrypt";

export const admin = {
  user: {
    uuid: uuids.admin.user,
    email: "admin@admin.com",
    password: hashSync("SecurePassword1010", 10),
    name: "admin",
    surname: "admin",
    secretary: "extension",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  admin: {
    userUuid: uuids.admin.user,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
