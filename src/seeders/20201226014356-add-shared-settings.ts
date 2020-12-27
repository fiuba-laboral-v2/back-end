import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("SharedSettings", [
      {
        uuid: "6b228e77-9e8e-4438-872e-f3714a5846dd",
        companySignUpAcceptanceCriteria:
          "Esta empresa estará pendiente de aprobación por personal de FIUBA",
        companyEditableAcceptanceCriteria:
          "Esta empresa estará pendiente de aprobación por personal de FIUBA",
        editOfferAcceptanceCriteria:
          "Esta oferta estará pendiente de aprobación por personal de FIUBA"
      }
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("SharedSettings", {});
  }
};
