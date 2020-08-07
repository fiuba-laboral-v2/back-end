import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "$models/Offer";
import { List } from "$graphql/fieldTypes";
import { ICompanyUser } from "src/graphql/Context";

const getMyOffers = {
  type: List(GraphQLOffer),
  resolve: (
    _: undefined,
    __: undefined,
    { currentUser }: { currentUser: ICompanyUser }) =>
      OfferRepository.findByCompanyUuid(currentUser.company.uuid)
};

export { getMyOffers };
