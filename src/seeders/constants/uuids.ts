import generateUuid from "uuid/v4";

export const uuids = {
  companies: {
    devartis: generateUuid(),
    mercadoLibre: generateUuid()
  },
  offers: {
    java_semi_senior: generateUuid(),
    java_senior: generateUuid(),
    java_junior: generateUuid(),
    ruby_senior: generateUuid(),
    ruby_junior: generateUuid(),
    ruby_semi_senior: generateUuid()
  },
  admin: {
    user: generateUuid()
  },
  sebastian: {
    applicant: generateUuid(),
    user: generateUuid()
  },
  aldana: {
    applicant: generateUuid(),
    user: generateUuid()
  },
  manuel: {
    user: generateUuid()
  },
  mariano: {
    user: generateUuid()
  },
  capabilities: {
    node: generateUuid(),
    RoR: generateUuid(),
    typescript: generateUuid(),
    python: generateUuid(),
    go: generateUuid(),
    c: generateUuid(),
    cPlusPlus: generateUuid(),
    java: generateUuid(),
    postgres: generateUuid(),
    mongo: generateUuid(),
    cassandra: generateUuid(),
    sql: generateUuid(),
    noSQL: generateUuid()
  }
};
