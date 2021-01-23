import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";

const TABLE_NAME = "SharedSettings";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    return queryInterface.bulkInsert(TABLE_NAME, [
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
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    return queryInterface.bulkDelete(TABLE_NAME, {});
  }
};
