export interface IApplicant {
  name: string;
  surname: string;
  padron: number;
  description?: string;
  credits: number;
  careersCodes: string[];
  capabilities?: string[];
}
