import { uuids } from "../../../uuids";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { description } from "../description";

export const javaSenior = {
  offer: {
    uuid: uuids.offers.javaSenior,
    companyUuid: uuids.companies.mercadoLibre,
    title: "Desarrollador Java senior",
    targetApplicantType: ApplicantType.graduate,
    description,
    isInternship: false,
    hoursPerDay: 8,
    minimumSalary: 80000,
    maximumSalary: 120000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: [
    {
      uuid: "6b228e77-9e8e-4438-872e-f3714a5846da",
      offerUuid: uuids.offers.javaSenior,
      title: "Requisitos",
      text:
        "• Tener formación en Ingeniería en Sistemas o carreras afines.\n\n" +
        "• Poseer experiencia previa de 5 años en Front End en ambientes de alto desempeño.\n\n" +
        "• Tener experiencia con tecnologías web abiertas como JavaScript, HTML y CSS.\n\n" +
        "• Contar con experiencia en NodeJS, Express, React, Sass, WPO y SEO.",
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: "0456a3b4-7514-4559-a69c-4f077942be46",
      offerUuid: uuids.offers.javaSenior,
      title: "Te proponemos",
      text:
        "• Ser parte de una compañía con espíritu emprendedor en la que nos " +
        "encanta pensar en grande y a largo plazo.\n\n" +
        "• Ser protagonista de tu desarrollo en un ambiente de oportunidades, " +
        "aprendizaje, crecimiento, expansión y proyectos desafiantes.\n\n" +
        "• Compartir y aprender en equipo junto a grandes profesionales y especialistas.\n\n" +
        "• Un excelente clima de trabajo, con todo lo necesario para que vivas " +
        "una gran experiencia.",
      displayOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
