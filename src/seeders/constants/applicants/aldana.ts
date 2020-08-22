import generateUuid from "uuid/v4";
import { uuids } from "../uuids";
import { careerCodes } from "../careerCodes";
import { ApprovalStatus } from "../../../models/ApprovalStatus/index";

export const aldana = {
  user: {
    uuid: uuids.aldana.user,
    email: "arastrelli@fi.uba.ar",
    password: "$2b$10$Mql5/mLtH.lJy0CxfjfozOuVWkztx4X3LAWh.WL5vXMv9pktoXDyW",
    name: "Aldana",
    surname: "Rastrelli",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  applicant: {
    uuid: uuids.aldana.applicant,
    userUuid: uuids.aldana.user,
    approvalStatus: ApprovalStatus.approved,
    padron: 98408,
    description: "Dev",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  sections: [
    {
      uuid: "6b228e77-9e8e-4438-872e-f3714a5842da",
      applicantUuid: uuids.aldana.applicant,
      title: "Campo 1",
      text: "Contenido 1",
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: "cf6f22c2-b1c9-4bf9-8717-7705e4c651e6",
      applicantUuid: uuids.aldana.applicant,
      title: "Campo 2",
      text: "Contenido 2",
      displayOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: "50eeb4ff-6428-43c4-aa55-714f5f290f74",
      applicantUuid: uuids.aldana.applicant,
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
      applicantUuid: uuids.aldana.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      capabilityUuid: uuids.capabilities.sql,
      applicantUuid: uuids.aldana.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      capabilityUuid: uuids.capabilities.c,
      applicantUuid: uuids.aldana.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  careers: [
    {
      careerCode: careerCodes.IngenieriaInformatica,
      applicantUuid: uuids.aldana.applicant,
      isGraduate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  jobApplications: [
    {
      uuid: generateUuid(),
      offerUuid: uuids.offers.java_semi_senior,
      applicantUuid: uuids.aldana.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
