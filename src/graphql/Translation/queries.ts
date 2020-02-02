import { nonNull, String, List } from "../fieldTypes";
import { TranslationRepository } from "../../models/Translation";

const translationQueries = {
  getTranslations: {
    type: nonNull(List(nonNull(String))),
    args: {
      paths: {
        type: nonNull(List(nonNull(String)))
      }
    },
    resolve: (_: undefined, { paths }: { paths: [string] }) => {
      return paths.map(path => TranslationRepository.translate(path));
    }
  }
};

export default translationQueries;
