import { nonNull, String, List } from "$graphql/fieldTypes";
import { TranslationRepository } from "$models/Translation";
import { GraphQLTranslation } from "./Types/Translation";

export const translationQueries = {
  getTranslations: {
    type: nonNull(List(nonNull(GraphQLTranslation))),
    args: {
      translationGroup: {
        type: nonNull(String)
      }
    },
    resolve: (_: undefined, { translationGroup }: { translationGroup: string }) => {
      return TranslationRepository.translate(translationGroup);
    }
  }
};
