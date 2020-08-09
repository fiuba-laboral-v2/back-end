import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "$models/Offer";
import { List, nonNull } from "$graphql/fieldTypes";
import { ICompanyUser } from "src/graphql/Context";

const getMyOffers = {
  type: nonNull(List(nonNull(GraphQLOffer))),
  resolve: (
    _: undefined,
    __: undefined,
    { currentUser }: { currentUser: ICompanyUser }) =>
      OfferRepository.findByCompanyUuid(currentUser.company.uuid)
};

export { getMyOffers };
