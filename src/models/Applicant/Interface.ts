import { TLink } from "./Link/Interface";
import { ICreateFiubaUser, IUser, IUserEditable } from "../User";
import { IApplicantCareer } from "./ApplicantCareer";

export interface IApplicant {
  padron: number;
  description?: string;
  careers: IApplicantCareer[];
  capabilities?: string[];
  knowledgeSections?: ISection[];
  experienceSections?: ISection[];
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
  knowledgeSections?: ISection[];
  experienceSections?: ISection[];
  links?: TLink[];
}

export interface ISection {
  uuid?: string;
  title: string;
  text: string;
  displayOrder: number;
}

export enum ApplicantType {
  graduate = "graduate",
  student = "student",
  both = "both"
}

export const targetApplicantTypeEnumValues = Object.keys(ApplicantType);
