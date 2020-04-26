import { TLink } from "./Link/Interface";
import { IUser } from "../User";

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
  links?: TLink[];
  user: IUser;
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
  links?: TLink[];
}

export type TSection = {
  uuid?: string;
  title: string;
  text: string;
  displayOrder: number;
};
