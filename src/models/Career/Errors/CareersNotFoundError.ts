export class CareersNotFoundError extends Error {
  public static buildMessage(codes: string[]) {
    return `Careers with codes: [${codes}] does not exist`;
  }

  constructor(codes: string[]) {
    super(CareersNotFoundError.buildMessage(codes));
  }
}
