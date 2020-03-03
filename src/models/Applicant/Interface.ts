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
}


export interface IApplicantEditable {
  name?: string;
  surname?: string;
  description?: string;
  careers?: IApplicantCareer[];
  capabilities?: string[];
}
