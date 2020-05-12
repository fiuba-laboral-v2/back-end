import { List } from "../../fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { CompanyRepository } from "../../../models/Company";

export const getCompanies = {
  type: List(GraphQLCompany),
  resolve: () => CompanyRepository.findAll()
};
