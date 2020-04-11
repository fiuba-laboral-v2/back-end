import { GraphQLCompanyResponse } from "../Company/ResponseSerializers";
import { GraphQLOfferResponse } from "../Offer/ResponseSerializers";
import { GraphQLCareerResponse } from "../Career/ResponseSerializers";

const GraphQLResponse = {
  offer: { ...GraphQLOfferResponse },
  company: { ...GraphQLCompanyResponse },
  career: { ...GraphQLCareerResponse }
};

export { GraphQLResponse };
