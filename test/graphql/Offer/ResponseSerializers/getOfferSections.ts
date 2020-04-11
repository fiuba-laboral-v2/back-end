import { OfferSection } from "../../../../src/models/Offer/OfferSection";

const getOfferSections = async (offerSection: OfferSection) => (
  {
    uuid: offerSection.uuid,
    title: offerSection.title,
    text: offerSection.text,
    displayOrder: offerSection.displayOrder
  }
);

export { getOfferSections };
