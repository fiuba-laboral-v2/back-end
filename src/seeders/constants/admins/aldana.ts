import { uuids } from "../uuids";
import { ApprovalStatus } from "../../../models/ApprovalStatus";
import { careerCodes } from "../../constants/careerCodes";

export const aldana = {
  user: {
    uuid: uuids.graduadosAdmin.user,
    email: "mllauro@fi.uba.ar",
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
  },
  applicant: {
    uuid: uuids.graduadosAdmin.applicant,
    userUuid: uuids.graduadosAdmin.user,
    padron: 99999,
    approvalStatus: ApprovalStatus.approved,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis faucibus sem, eu " +
      "commodo tortor. Pellentesque posuere volutpat bibendum. Cras ipsum enim, tempus sed neque " +
      "id, varius hendrerit ex. Sed egestas massa ultricies tempus luctus. Nunc blandit semper " +
      "justo at fermentum. Nam aliquet suscipit odio, sit amet commodo justo bibendum ut. " +
      "Integer vestibulum et mauris vitae volutpat. Aenean nec ante porta, gravida velit at, " +
      "semper tellus. Integer ut viverra mauris, vel imperdiet neque. Pellentesque aliquam " +
      "molestie lorem, in finibus ante porttitor accumsan. Aliquam vel porta arcu. Donec neque " +
      "orci, euismod eget est non, faucibus sodales turpis. Sed sed luctus ante. Quisque metus " +
      "eros, mattis et dui nec, rhoncus interdum tortor. Vestibulum aliquam ipsum non ex porta, " +
      "maximus placerat neque suscipit. Nunc luctus non justo quis posuere.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  careers: [
    {
      careerCode: careerCodes.IngenieriaElectricista,
      applicantUuid: uuids.graduadosAdmin.applicant,
      isGraduate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
