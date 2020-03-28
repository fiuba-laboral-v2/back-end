export class ApplicantNotFound extends Error {
  constructor(field: string | number) {
    if (typeof field === "string") {
      super(`Applicant with uuid: ${field} does not exist`);
    } else {
      super(`Applicant with padron: ${field} does not exist`);
    }
  }
}
