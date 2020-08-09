import { IOfferSection } from "./OfferSection/Interface";
import { IOfferCareer } from "./OfferCareer/Interface";

export interface ICreateOffer {
  title: string;
  description: string;
  hoursPerDay: number;
  minimumSalary: number;
  maximumSalary: number;
  sections?: IOfferSection[];
  careers?: IOfferCareer[];
  companyUuid: string;
}

export interface IUpdateOffer extends ICreateOffer {
  uuid: string;
}

export interface IOfferAttributes extends ICreateOffer {
  companyUuid: string;
}

export interface IOffer extends IUpdateOffer {
  companyUuid: string;
}
