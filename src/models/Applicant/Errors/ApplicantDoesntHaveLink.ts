export class ApplicantDoesntHaveLink extends Error {
  constructor(uuid: string, linkUuid: string) {
    super(`Applicant with uuid: ${uuid} does not have the link: ${linkUuid}`);
  }
}
