export class CareersNotFound extends Error {
  public static buildMessage(codes: string[]) {
    return `Careers with codes: [${codes}] does not exist`;
  }

  constructor(codes: string[]) {
    super(CareersNotFound.buildMessage(codes));
  }
}
