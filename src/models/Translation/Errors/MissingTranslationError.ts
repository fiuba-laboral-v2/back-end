export class MissingTranslationError extends Error {
  public static buildMessage(translationGroup: string) {
    return `Missing translation: ${translationGroup}`;
  }

  constructor(translationGroup: string) {
    super(MissingTranslationError.buildMessage(translationGroup));
  }
}
