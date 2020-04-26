export class ApplicantRequiredError extends Error {
  constructor() {
    super("You are not an applicant");
  }
}
