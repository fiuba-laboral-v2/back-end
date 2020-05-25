import { QueryInterface } from "sequelize";
import { uuids } from "./constants/uuids";
import { careerCodes } from "./constants/careerCodes";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert(
        "Applicants",
        [
          {
            uuid: uuids.sebastian.applicant,
            userUuid: uuids.sebastian.user,
            padron: 98539,
            description: "Me considero una persona a la que le gusta tomar " +
              "riesgos y también tener cierto control sobre la situación." +
              "Por eso tengo como objetivos ser un desarrollador de software y" +
              "también formar parte de la gestión de proyectos, ya " +
              "que me interesa el balance de esos aspectos.",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "Sections",
        [
          {
            uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71",
            applicantUuid: uuids.sebastian.applicant,
            title: "Experiencia Laboral",
            text: "Trabajo junto al equipo de Keepcon como desarrollador full stack." +
              "Por ejemplo, estoy trabajando en la integración de LinkedIn a" +
              " la herramienta.\nTrabajo en Rails con un frontend en Backbone.js," +
              "y en un motor de procesamiento de datos de redes sociales en" +
              "Apache Storm (Java). Respecto del uso base de datos, trabajo " +
              "con PostgreSQL y Cassandra indexada con Elasticsearch.",
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "ApplicantsCapabilities",
        [
          {
            capabilityUuid: uuids.capabilities.java,
            applicantUuid: uuids.sebastian.applicant,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "CareersApplicants",
        [
          {
            careerCode: careerCodes.IngenieriaInformatica,
            applicantUuid: uuids.sebastian.applicant,
            creditsCount: 216,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction }
      );

      await queryInterface.bulkInsert(
        "Applicants",
        [
          {
            uuid: uuids.aldana.applicant,
            userUuid: uuids.aldana.user,
            padron: 98408,
            description: "Dev",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction }
      );

      await queryInterface.bulkInsert(
        "Sections",
        [
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
        { transaction }
      );

      await queryInterface.bulkInsert(
        "ApplicantsCapabilities",
        [
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
        { transaction }
      );

      await queryInterface.bulkInsert(
        "CareersApplicants",
        [
          {
            careerCode: careerCodes.IngenieriaInformatica,
            applicantUuid: uuids.aldana.applicant,
            creditsCount: 56,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction }
      );

      await queryInterface.bulkInsert(
        "JobApplications",
        [
          {
            offerUuid: uuids.offers.java_semi_senior,
            applicantUuid: uuids.aldana.applicant,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        { transaction }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete("Sections", {}, { transaction });
      await queryInterface.bulkDelete("ApplicantsCapabilities", {}, { transaction });
      await queryInterface.bulkDelete("CareersApplicants", {}, { transaction });
      await queryInterface.bulkDelete("JobApplications", {}, { transaction });
      await queryInterface.bulkDelete("Applicants", {}, { transaction });
    });
  }
};
