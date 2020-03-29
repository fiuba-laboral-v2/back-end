export interface IApplicantCareer {
  code: string;
  creditsCount: number;
}

export interface IApplicant {
  name: string;
  surname: string;
  padron: number;
  description?: string;
  careers: IApplicantCareer[];
  capabilities?: string[];
  sections?: TSection[];
}

export interface IApplicantEditable {
  uuid: string;
  padron?: number;
  name?: string;
  surname?: string;
  description?: string;
  careers?: IApplicantCareer[];
  capabilities?: string[];
  sections?: TSection[];
}

export type TSection = {
  title: string;
  text: string;
};
