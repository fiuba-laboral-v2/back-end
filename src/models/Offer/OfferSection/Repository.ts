import { Offer, OfferSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export class OfferSectionRepository extends SectionRepository {
  public async update({
    offer,
    ...updateArguments
  }: IUpdateProps & { offer: Offer }): Promise<OfferSection[]> {
    return super.updateSection({ model: offer, ...updateArguments });
  }
  public findByOffer(offer: Offer): Promise<OfferSection[]> {
    return super.findByEntity({ model: offer });
  }

  protected modelClass() {
    return OfferSection;
  }

  protected modelUuidKey() {
    return "offerUuid";
  }
}
