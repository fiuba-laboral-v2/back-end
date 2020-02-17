export class ApplicantNotFound extends Error {
  constructor(padron: number) {
    super(`Applicant with padron: ${padron} does not exists`);
  }
}
