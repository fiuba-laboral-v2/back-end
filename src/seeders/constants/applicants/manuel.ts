import { uuids } from "../uuids";
import { careerCodes } from "../careerCodes";
import { ApprovalStatus } from "../../../models/ApprovalStatus/index";
import generateUuid from "uuid/v4";

export const manuel = {
  user: {
    uuid: uuids.manuel.user,
    email: "mllauro@fi.uba.ar",
    name: "Manuel Luis",
    surname: "Llauró",
    dni: "222",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  applicant: {
    uuid: uuids.manuel.applicant,
    userUuid: uuids.manuel.user,
    approvalStatus: ApprovalStatus.approved,
    padron: 95736,
    description: "Dev",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  sections: [
    {
      uuid: generateUuid(),
      applicantUuid: uuids.manuel.applicant,
      title: "Campo 1",
      text: "Contenido 1",
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: generateUuid(),
      applicantUuid: uuids.manuel.applicant,
      title: "Campo 2",
      text: "Contenido 2",
      displayOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: generateUuid(),
      applicantUuid: uuids.manuel.applicant,
      title: "Campo 3",
      text: "Contenido 3",
      displayOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  capabilities: [
    {
      capabilityUuid: uuids.capabilities.python,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      capabilityUuid: uuids.capabilities.sql,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      capabilityUuid: uuids.capabilities.c,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  careers: [
    {
      careerCode: careerCodes.IngenieriaInformatica,
      applicantUuid: uuids.manuel.applicant,
      isGraduate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  jobApplications: [
    {
      uuid: generateUuid(),
      offerUuid: uuids.offers.javaSemiSenior,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
