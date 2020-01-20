import { nonNull, String } from "../field_types";
import { TranslationRepository } from "../../models/translations";

const translationQueries = {
  translation: {
    type: String,
    args: {
      path: {
        type: nonNull(String)
      }
    },
    resolve: (_: undefined, { path }: { path: string }) => {
      return TranslationRepository.translate(path);
    }
  }
};

export default translationQueries;
