import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkInsert("SharedSettings", [
      {
        uuid: "6b228e77-9e8e-4438-872e-f3714a5846dd",
        companySignUpAcceptanceCriteria:
          "¡Bienvenida/o a la Bolsa de Trabajo FIUBA!\n\n" +
          "El perfil de empresa debe ser aprobado " +
          "por personal de FIUBA antes de poder publicar ofertas.\n\n" +
          "Tener en cuenta lo siguiente:\n\n" +
          "• Por favor llenar el perfil de empresa en español.\n\n" +
          "• Las fotos no deben contener texto.",
        companyEditableAcceptanceCriteria:
          "Al editar el perfil se notificarán los cambios a personal de FIUBA.\n\n" +
          "Recuerde que:\n\n" +
          "• El perfil de empresa y las ofertas deben estar en español.\n\n" +
          "• Las fotos no deben contener texto.",
        editOfferAcceptanceCriteria:
          "Tener en cuenta lo siguiente:\n\n" +
          "• No debe haber mucha diferencia entre el salario mínimo y máximo.\n\n" +
          "• El criterio de selección no debe ser discriminatorio.\n" +
          "(Por ejemplo: solo hombres)\n\n" +
          "• La oferta debe estar en español."
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkDelete("SharedSettings", {});
  }
};
