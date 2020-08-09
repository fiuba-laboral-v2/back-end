import { TLink } from "./Link/Interface";
import { ICreateFiubaUser, IUser, IUserEditable } from "../User";

export interface IApplicantCareer {
  code: string;
  creditsCount: number;
}

export interface IApplicant {
  padron: number;
  description?: string;
  careers: IApplicantCareer[];
  capabilities?: string[];
  sections?: TSection[];
  links?: TLink[];
  user: IUser;
}

export interface ISaveApplicant extends IApplicant {
  user: ICreateFiubaUser;
}

export interface IApplicantEditable {
  uuid: string;
  user?: IUserEditable;
  padron?: number;
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
