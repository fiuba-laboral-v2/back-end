import { UniqueConstraintError } from "sequelize";

import { OfferSectionRepository } from "$models/Offer/OfferSection";
import { Offer } from "$models";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";

import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";

import { UUID_REGEX } from "$test/models";

describe("OfferSectionRepository", () => {
  let offer: Offer;
  const offerSectionRepository = new OfferSectionRepository();

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    offer = await createOffer();
  });

  const createOffer = async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    return OfferGenerator.instance.withObligatoryData({ companyUuid });
  };

  it("creates a valid new section", async () => {
    const sectionData = { title: "title", text: "text", displayOrder: 1 };
    await offerSectionRepository.update({ sections: [sectionData], offer });
    const sections = await offerSectionRepository.findByOffer(offer);
    expect(sections).toEqual([
      expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        ...sectionData
      })
    ]);
  });

  it("updates a section", async () => {
    const sectionData = { title: "title", text: "text", displayOrder: 1 };
    await offerSectionRepository.update({ sections: [sectionData], offer });
    const [section] = await offerSectionRepository.findByOffer(offer);
    expect(section).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...sectionData
    });
    const newSectionData = {
      uuid: section.uuid,
      title: "newTitle",
      text: "newText",
      displayOrder: 1
    };
    const [updatedSection] = await offerSectionRepository.update({
      sections: [newSectionData],
      offer
    });
    expect(updatedSection).toBeObjectContaining(newSectionData);
  });

  it("creates two sections with the same displayOrder for different offers", async () => {
    const anotherOffer = await createOffer();
    const sectionData = { title: "title", text: "text", displayOrder: 1 };
    const [section] = await offerSectionRepository.update({ sections: [sectionData], offer });
    const [anotherSection] = await offerSectionRepository.update({
      sections: [sectionData],
      offer: anotherOffer
    });

    expect(section).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      offerUuid: offer.uuid,
      ...sectionData
    });

    expect(anotherSection).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      offerUuid: anotherOffer.uuid,
      ...sectionData
    });
  });

  it("throws an error if two sections have the same displayOrder for the same offer", async () => {
    const sectionData = { title: "title", text: "text", displayOrder: 1 };
    await expect(
      offerSectionRepository.update({ sections: [sectionData, sectionData], offer })
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("throws an error if two sections have the same uuid", async () => {
    const sectionData = { title: "title", text: "text", displayOrder: 1 };
    const [{ uuid }] = await offerSectionRepository.update({ sections: [sectionData], offer });
    const newSectionData = { uuid, title: "newTitle", text: "newText", displayOrder: 1 };
    const anotherNewSectionData = { uuid, title: "newTitle", text: "newText", displayOrder: 2 };

    await expect(
      offerSectionRepository.update({ sections: [newSectionData, anotherNewSectionData], offer })
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  describe("truncate", () => {
    it("deletes al offerSections", async () => {
      const sectionData = { title: "title", text: "text", displayOrder: 1 };
      await offerSectionRepository.update({ sections: [sectionData], offer });
      expect(await offerSectionRepository.findByOffer(offer)).toHaveLength(1);
      await offerSectionRepository.truncate();
      expect(await offerSectionRepository.findByOffer(offer)).toHaveLength(0);
    });

    it("deletes al offerSections by truncating Offers table", async () => {
      const sectionData = { title: "title", text: "text", displayOrder: 1 };
      await offerSectionRepository.update({ sections: [sectionData], offer });
      expect(await offerSectionRepository.findByOffer(offer)).toHaveLength(1);
      await OfferRepository.truncate();
      expect(await offerSectionRepository.findByOffer(offer)).toHaveLength(0);
    });
  });
});
