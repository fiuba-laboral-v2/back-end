import { nonNull, String, List } from "../fieldTypes";
import { TranslationRepository } from "../../models/Translation";
import { GraphQLTranslation } from "./Types/Translation";

const translationQueries = {
  getTranslations: {
    type: nonNull(List(nonNull(GraphQLTranslation))),
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
