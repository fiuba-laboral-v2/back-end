import { IOfferSection } from "./OfferSection/Interface";

export interface IOffer {
  companyId: number;
  title: string;
  description: string;
  hoursPerDay: number;
  minimumSalary: number;
  maximumSalary: number;
  sections?: IOfferSection[];
}
