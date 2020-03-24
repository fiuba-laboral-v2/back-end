export class ApplicantNotFound extends Error {
  constructor(uuid: string) {
    super(`Applicant with uuid: ${uuid} does not exist`);
  }
}
