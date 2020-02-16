export class CompanyNotFoundError extends Error {
  constructor(id: number) {
    super(`Company with id: ${id} does not exists`);
  }
}
