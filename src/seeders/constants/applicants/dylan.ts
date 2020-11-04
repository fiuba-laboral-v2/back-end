import { ApprovalStatus } from "../../../models/ApprovalStatus/index";
import { uuids } from "../uuids";
import { careerCodes } from "../careerCodes";

export const dylan = {
  user: {
    uuid: uuids.dylan.user,
    email: "dalvarez@fi.uba.ar",
    name: "Dylan Gustavo",
    surname: "Alvarez Avalos",
    dni: "111",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  applicant: {
    uuid: uuids.dylan.applicant,
    userUuid: uuids.dylan.user,
    padron: 98225,
    approvalStatus: ApprovalStatus.approved,
    description:
      "Hoy trabajo desde Devartis junto al equipo de Keepcon, manteniendo el sitio tanto en " +
      "frontend como backend. Por ejemplo, trabajé en la integración de Instagram a la " +
      "herramienta, y en la migración a Elasticsearch 6.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  sections: [
    {
      uuid: uuids.dylan.sections.experience,
      applicantUuid: uuids.dylan.applicant,
      title: "Experiencia Laboral",
      text:
        "Trabajé con Django, y hoy con Rails + Backbone.js + Sass, en conjunto con el " +
        "procesamiento de contenidos de redes sociales con Apache Storm, en Java.\n" +
        "Uso PostgreSQL y Cassandra.",
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  capabilities: [
    {
      capabilityUuid: uuids.capabilities.mongo,
      applicantUuid: uuids.dylan.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  careers: [
    {
      careerCode: careerCodes.IngenieriaEnPetroleo,
      applicantUuid: uuids.dylan.applicant,
      currentCareerYear: 5,
      approvedSubjectCount: 44,
      isGraduate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      careerCode: careerCodes.LicenciaturaEnAnalisisDeSistemas,
      applicantUuid: uuids.dylan.applicant,
      currentCareerYear: 1,
      approvedSubjectCount: 4,
      isGraduate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  jobApplications: [
    {
      uuid: uuids.dylan.jobApplications.javaSemiSenior,
      offerUuid: uuids.offers.javaSemiSenior,
      applicantUuid: uuids.dylan.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: uuids.dylan.jobApplications.javaJunior,
      offerUuid: uuids.offers.javaJunior,
      applicantUuid: uuids.dylan.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: uuids.dylan.jobApplications.rubyJunior,
      offerUuid: uuids.offers.rubyJunior,
      applicantUuid: uuids.dylan.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
