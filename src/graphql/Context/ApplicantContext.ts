export interface IApplicantUser {
  uuid: string;
  email: string;
  adminUuid?: undefined;
  applicant: { uuid: string; };
  company?: undefined;
}
