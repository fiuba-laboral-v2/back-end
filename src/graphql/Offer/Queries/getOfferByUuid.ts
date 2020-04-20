import { GraphQLOffer } from "../Types/GraphQLOffer";
import { ID, nonNull } from "../../fieldTypes";
import { OfferRepository } from "../../../models/Offer";

const getOfferByUuid = {
  type: GraphQLOffer,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }: { uuid: string }) => OfferRepository.findByUuid(uuid)
};

export { getOfferByUuid };
