import { uuids } from "../uuids";

export const aldana = {
  user: {
    uuid: uuids.graduadosAdmin.user,
    email: "arastrelli@fi.uba.ar",
    name: "Aldana",
    surname: "Rastrelli",
    dni: "999",
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
