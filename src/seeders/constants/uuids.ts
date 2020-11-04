import generateUuid from "uuid/v4";

export const uuids = {
  companies: {
    devartis: {
      uuid: generateUuid()
    },
    mercadoLibre: {
      uuid: generateUuid()
    }
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
    user: generateUuid(),
    sections: {
      experience: generateUuid()
    },
    jobApplications: {
      javaSemiSenior: generateUuid(),
      javaJunior: generateUuid(),
      javaSenior: generateUuid(),
      rubyJunior: generateUuid()
    }
  },
  dylan: {
    applicant: generateUuid(),
    user: generateUuid(),
    sections: {
      experience: generateUuid()
    },
    jobApplications: {
      javaSemiSenior: generateUuid(),
      javaJunior: generateUuid(),
      rubyJunior: generateUuid()
    }
  },
  manuel: {
    applicant: generateUuid(),
    user: generateUuid(),
    sections: {
      field1: generateUuid(),
      field2: generateUuid(),
      field3: generateUuid()
    },
    jobApplications: {
      javaSemiSenior: generateUuid()
    }
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
