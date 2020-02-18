export class CareersNotFound extends Error {
  constructor(code: string[]) {
    super(`Careers with code: ${code} does not exists`);
  }
}
