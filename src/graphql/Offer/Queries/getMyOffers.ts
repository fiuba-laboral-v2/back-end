import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "../../../models/Offer";
import { List } from "../../fieldTypes";
import { ICompanyUser } from "src/graphqlContext";

const getMyOffers = {
  type: List(GraphQLOffer),
  resolve: (
    _: undefined,
    __: undefined,
    { currentUser }: { currentUser: ICompanyUser }) => OfferRepository.findAll({ where: {
      companyUuid: currentUser.companyUuid
    }})
};

export { getMyOffers };
