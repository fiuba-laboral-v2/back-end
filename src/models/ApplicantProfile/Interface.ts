export interface IApplicantProfile {
  name: string;
  surname: string;
  padron: number;
  description?: string;
  credits: number;
  careers_codes: string[];
  capabilities?: string[];
}
