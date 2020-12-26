import { QueryInterface } from "sequelize";
import { UUID } from "../models/UUID";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("SharedSettings", [
      {
        uuid: UUID.generate(),
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
