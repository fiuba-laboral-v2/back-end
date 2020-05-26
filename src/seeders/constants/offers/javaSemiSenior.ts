import { uuids } from "../uuids";

export const javaSemiSenior = {
  offer: {
    uuid: uuids.offers.java_semi_senior,
    companyUuid: uuids.companies.devartis,
    title: "Desarrollador Java semi senior",
    description: "En Mercado Libre estamos democratizando el comercio, el dinero " +
      "y los pagos en América Latina.\n\n" +
      "Tecnología es la esencia de nuestro producto. Nuestros equipos de desarrollo, " +
      "arquitectura, base de datos, user experience y business intelligence co-crean y " +
      "son responsables de la plataforma líder de e-commerce de América Latina y de uno " +
      "de los sitios de mayor tráfico en todo el mundo. En una industria que se reinventa " +
      "día a día, nuestros equipos son reconocidos por su visión y liderazgo. Desde " +
      "aplicaciones móviles a machine learning, nuestra innovación tiene un claro " +
      "foco: simplificarle la vida a quien utiliza nuestros productos.",
    hoursPerDay: 6,
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: [
    {
      uuid: "6b228e77-9e8e-4438-872e-f3714a5842da",
      offerUuid: uuids.offers.java_semi_senior,
      title: "Requisitos",
      text: "• Tener formación en Ingeniería en Sistemas o carreras afines.\n\n" +
        "• Poseer experiencia previa de 2 años en Front End en ambientes de alto desempeño.\n\n" +
        "• Tener experiencia con tecnologías web abiertas como JavaScript, HTML y CSS.\n\n" +
        "• Contar con experiencia en NodeJS, Express, React, Sass, WPO y SEO.",
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: "0456a3b4-7514-4559-a69c-4f077942be58",
      offerUuid: uuids.offers.java_semi_senior,
      title: "Te proponemos",
      text: "• Ser parte de una compañía con espíritu emprendedor en la que nos " +
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
