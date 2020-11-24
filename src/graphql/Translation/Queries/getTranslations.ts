import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLTranslation } from "$graphql/Translation/Types/Translation";
import { TranslationRepository } from "$models/Translation";

export const getTranslations = {
  type: nonNull(GraphQLTranslation),
  args: {
    translationGroup: {
      type: nonNull(String)
    }
  },
  resolve: (_: undefined, { translationGroup }: { translationGroup: string }) => {
    return TranslationRepository.translate(translationGroup);
  }
};
