import generateUuid from "uuid/v4";

export const uuids = {
  companies: {
    devartis: generateUuid(),
    mercadoLibre: generateUuid()
  },
  offers: {
    javaSemiSenior: generateUuid(),
    javaSenior: generateUuid(),
    javaJunior: generateUuid(),
    rubySenior: generateUuid(),
    rubyJunior: generateUuid(),
    rubySemiSenior: generateUuid(),
    swiftInternship: generateUuid(),
    kotlinInternship: generateUuid()
  },
  extensionAdmin: {
    user: generateUuid()
  },
  graduadosAdmin: {
    user: generateUuid()
  },
  sebastian: {
    applicant: generateUuid(),
    user: generateUuid()
  },
  dylan: {
    applicant: generateUuid(),
    user: generateUuid()
  },
  manuel: {
    applicant: generateUuid(),
    user: generateUuid()
  },
  claudio: {
    user: generateUuid()
  },
  marcos: {
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
