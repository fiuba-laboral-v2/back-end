import { getOfferByUuid } from "./getOfferByUuid";
import { getOfferSections } from "./getOfferSections";
import { getOffers } from "./getOffers";
import { saveOfferWithCompleteData } from "./saveOfferWithCompleteData";
import { saveOfferWithOnlyObligatoryData } from "./saveOfferWithOnlyObligatoryData";

const GraphQLOfferResponse = {
  getOfferByUuid,
  getOfferSections,
  getOffers,
  saveOfferWithCompleteData,
  saveOfferWithOnlyObligatoryData
};

export { GraphQLOfferResponse };
