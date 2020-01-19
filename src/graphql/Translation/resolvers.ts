"use strict";

import identity from "lodash/identity";
import { TranslationRepository } from "../../models/translations";

export = {
  Translation: {
    translation: identity
  },
  Query: {
    getTranslationByPath: (_, { path }: { path: string }) => {
      return TranslationRepository.translate(path);
    }
  }
};
