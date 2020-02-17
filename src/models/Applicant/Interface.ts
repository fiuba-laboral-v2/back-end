export interface IApplicant {
  name: string;
  surname: string;
  padron: number;
  description?: string;
  credits: number;
  careersCodes: number[];
  capabilities?: string[];
}
