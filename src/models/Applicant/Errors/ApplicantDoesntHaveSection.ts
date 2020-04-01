export class ApplicantDoesntHaveSection extends Error {
  constructor(uuid: string, sectionUuid: string) {
    super(`Applicant with uuid: ${uuid} does not have the section: ${sectionUuid}`);
  }
}
