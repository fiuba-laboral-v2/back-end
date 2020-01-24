import { nonNull, String } from "$graphql/fieldTypes";
import { TranslationRepository } from "$models/Translation";

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
