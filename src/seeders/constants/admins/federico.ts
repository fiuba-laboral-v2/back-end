import { uuids } from "../uuids";

export const federico = {
  user: {
    uuid: uuids.extensionAdmin.user,
    email: "fresnik@fi.uba.ar",
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
