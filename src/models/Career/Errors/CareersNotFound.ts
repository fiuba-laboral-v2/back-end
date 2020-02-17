export class CareersNotFound extends Error {
  constructor(code: number[]) {
    super(`Careers with code: ${code} does not exists`);
  }
}
