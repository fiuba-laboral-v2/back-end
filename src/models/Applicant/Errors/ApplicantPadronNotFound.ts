export class ApplicantPadronNotFound extends Error {
  constructor(padron: number) {
    super(`Applicant with padron: ${padron} does not exist`);
  }
}
