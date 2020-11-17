import { v4 as generateUuid } from "uuid";

export const sections = (offerUuid: string) => [
  {
    uuid: generateUuid(),
    offerUuid,
    title: "Requisitos",
    text:
      "• Tener formación en Ingeniería en Sistemas o carreras afines.\n\n" +
      "• Poseer experiencia previa de 2 años en Front End en ambientes de alto desempeño.\n\n" +
      "• Tener experiencia con tecnologías web abiertas como JavaScript, HTML y CSS.\n\n" +
      "• Contar con experiencia en NodeJS, Express, React, Sass, WPO y SEO.",
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uuid: generateUuid(),
    offerUuid,
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
];
