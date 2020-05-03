export class CompanyNotFoundError extends Error {
  constructor(uuid: string) {
    super(`Company with uuid: ${uuid} does not exists`);
  }
}
