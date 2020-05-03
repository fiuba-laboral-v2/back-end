import { QueryInterface } from "sequelize";
import { uuids } from "./constants/uuids-constants";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert(
        "Applicants",
        [
          {
            uuid: uuids.sebastian.applicant,
            userUuid: uuids.sebastian.user,
            name: "Sebastian",
            surname: "Blanco",
            padron: 98539,
            description: `Me considero una persona a la que le gusta tomar
                          riesgos y también tener cierto control sobre la situación.
                          Por eso tengo como objetivos ser un desarrollador de software
                          y también formar parte de la gestión de proyectos, ya que
                          me interesa el balance de esos aspectos.`,
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
            text: `Trabajo junto al equipo de Keepcon como desarrollador full
                   stack. Por ejemplo, estoy trabajando en la integración de
                   LinkedIn a la herramienta.
                   Trabajo en Rails con un frontend en Backbone.js, y en un motor
                   de procesamiento de datos de redes sociales en Apache Storm (Java).
                   Respecto del uso base de datos, trabajo con PostgreSQL y Cassandra
                   indexada con Elasticsearch.`,
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
            careerCode: "10",
            applicantUuid: uuids.sebastian.applicant,
            creditsCount: 216,
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
      await queryInterface.bulkDelete("Applicants", {}, { transaction });
    });
  }
};
