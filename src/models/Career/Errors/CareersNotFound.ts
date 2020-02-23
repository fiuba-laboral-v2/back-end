export class CareersNotFound extends Error {
  constructor(codes: string[]) {
    super(`Careers with codes: [${codes}] does not exist`);
  }
}
