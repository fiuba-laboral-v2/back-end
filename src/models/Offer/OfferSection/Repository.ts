import { Offer, OfferSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export class OfferSectionRepository extends SectionRepository {
  public async update({
    offer,
    ...updateArguments
  }: IUpdateProps & { offer: Offer }): Promise<OfferSection[]> {
    return super.updateSection({ entity: offer, ...updateArguments });
  }
  public findByOffer(offer: Offer): Promise<OfferSection[]> {
    return super.findByEntity({ entity: offer });
  }

  protected modelClass() {
    return OfferSection;
  }

  protected entityUuidKey() {
    return "offerUuid";
  }
}
