import { UUID } from "../../models/UUID";

export const uuids = {
  companies: {
    devartis: {
      uuid: UUID.generate()
    },
    mercadoLibre: {
      uuid: UUID.generate()
    }
  },
  offers: {
    javaSemiSenior: UUID.generate(),
    juliaSemiSeniorExpired: UUID.generate(),
    cobolSemiSeniorApproved: UUID.generate(),
    pythonSemiSeniorExpiredForOne: UUID.generate(),
    javaSenior: UUID.generate(),
    javaJunior: UUID.generate(),
    rubySenior: UUID.generate(),
    rubyJunior: UUID.generate(),
    rubySemiSenior: UUID.generate(),
    swiftInternship: UUID.generate(),
    kotlinInternship: UUID.generate()
  },
  extensionAdmin: {
    user: UUID.generate()
  },
  graduadosAdmin: {
    user: UUID.generate(),
    applicant: UUID.generate()
  },
  sebastian: {
    applicant: UUID.generate(),
    user: UUID.generate(),
    sections: {
      experience: UUID.generate()
    },
    jobApplications: {
      javaSemiSenior: UUID.generate(),
      javaJunior: UUID.generate(),
      javaSenior: UUID.generate(),
      rubyJunior: UUID.generate()
    }
  },
  dylan: {
    applicant: UUID.generate(),
    user: UUID.generate(),
    sections: {
      experience: UUID.generate()
    },
    jobApplications: {
      javaSemiSenior: UUID.generate(),
      javaJunior: UUID.generate(),
      rubyJunior: UUID.generate()
    }
  },
  manuel: {
    applicant: UUID.generate(),
    user: UUID.generate(),
    sections: {
      field1: UUID.generate(),
      field2: UUID.generate(),
      field3: UUID.generate()
    },
    jobApplications: {
      javaSemiSenior: UUID.generate()
    }
  },
  claudio: {
    user: UUID.generate(),
    companyUser: UUID.generate()
  },
  marcos: {
    user: UUID.generate(),
    companyUser: UUID.generate()
  },
  capabilities: {
    node: UUID.generate(),
    RoR: UUID.generate(),
    typescript: UUID.generate(),
    python: UUID.generate(),
    go: UUID.generate(),
    c: UUID.generate(),
    cPlusPlus: UUID.generate(),
    java: UUID.generate(),
    postgres: UUID.generate(),
    mongo: UUID.generate(),
    cassandra: UUID.generate(),
    sql: UUID.generate(),
    noSQL: UUID.generate()
  }
};
