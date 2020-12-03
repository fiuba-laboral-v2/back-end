import { uuids } from "../uuids";

export const federico = {
  user: {
    uuid: uuids.extensionAdmin.user,
    email: "dylanalvarez1995@gmail.com",
    name: "Federico",
    surname: "Resnik",
    dni: "888",
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
