import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { ApplicantType } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { OfferNotFoundError } from "$models/Offer/Errors";
import { Career, Company, Offer, OfferCareer, OfferSection } from "$models";
import { CompanyGenerator } from "$generators/Company";
import { IForAllTargetsAndStatuses, OfferGenerator } from "$generators/Offer";
import { CareerGenerator } from "$generators/Career";
import { omit, range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import MockDate from "mockdate";
import moment from "moment";

describe("OfferRepository", () => {
  let firstCareer: Career;
  let secondCareer: Career;
  let thirdCareer: Career;
  let fourthCareer: Career;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await OfferRepository.truncate();

    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
    thirdCareer = await CareerGenerator.instance();
    fourthCareer = await CareerGenerator.instance();
  });

  const sectionData = {
    title: "title",
    text: "text",
    displayOrder: 1
  };

  const expectToCreateAValidOfferWithTarget = async (targetApplicantType: ApplicantType) => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const offerProps = OfferGenerator.data.withObligatoryData({ companyUuid, targetApplicantType });
    const offer = await OfferRepository.create(offerProps);
    const { careers, sections, ...offerAttributes } = offerProps;
    expect(offer).toBeObjectContaining(offerAttributes);
  };

  describe("Create", () => {
    it("creates a new offer", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offerProps = OfferGenerator.data.withObligatoryData({ companyUuid });
      const offer = await OfferRepository.create(offerProps);
      const { careers, sections, ...offerAttributes } = offerProps;
      expect(offer).toBeObjectContaining(offerAttributes);
    });

    it("creates a new offer with a targetApplicantType for students", async () => {
      await expectToCreateAValidOfferWithTarget(ApplicantType.student);
    });

    it("creates a new offer with a targetApplicantType for graduates", async () => {
      await expectToCreateAValidOfferWithTarget(ApplicantType.graduate);
    });

    it("creates a new offer with a targetApplicantType for both graduates and students", async () => {
      await expectToCreateAValidOfferWithTarget(ApplicantType.both);
    });

    it("creates a new offer with one section", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const offer = await OfferRepository.create({ ...attributes, sections: [sectionData] });
      const { careers, sections, ...offerAttributes } = attributes;
      expect(offer).toBeObjectContaining(offerAttributes);
      expect(await offer.getSections()).toEqual([expect.objectContaining(sectionData)]);
    });

    it("creates a new offer with one career", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = firstCareer;
      const attributes = OfferGenerator.data.withObligatoryData({
        companyUuid,
        careers: [{ careerCode }]
      });
      const offer = await OfferRepository.create(attributes);
      const { careers, sections, ...offerAttributes } = attributes;
      expect(offer).toBeObjectContaining(offerAttributes);
      expect(await offer.getCareers()).toEqual([
        expect.objectContaining({ code: attributes.careers![0].careerCode })
      ]);
    });

    it("creates a new offer with one career and one section", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = firstCareer;
      const careerData = { careerCode };
      const attributes = OfferGenerator.data.withObligatoryData({
        companyUuid,
        careers: [careerData]
      });
      const offer = await OfferRepository.create({
        ...attributes,
        sections: [sectionData]
      });
      expect(offer).toBeObjectContaining(omit(attributes, ["sections", "careers"]));
      const careers = await offer.getCareers();
      const sections = await offer.getSections();
      expect(sections).toEqual([expect.objectContaining(sectionData)]);
      expect(careers.map(c => c.code)).toEqual([careerData.careerCode]);
    });

    describe("Rollback Transaction", () => {
      it("throws error if offer has invalid companyUuid and not create the section", async () => {
        const attributes = OfferGenerator.data.withObligatoryData({
          companyUuid: null as any,
          sections: [sectionData]
        });
        await expect(OfferRepository.create(attributes)).rejects.toThrow(
          "notNull Violation: Offer.companyUuid cannot be null"
        );
      });

      it("throws error if section has no title and not create the offer", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        const attributes = OfferGenerator.data.withObligatoryData({
          companyUuid,
          sections: [
            {
              ...sectionData,
              title: null as any
            }
          ]
        });
        await expect(OfferRepository.create(attributes)).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });

      it("throws error if career is invalid and not create the offer", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        const careerCode = null as any;
        const attributes = OfferGenerator.data.withObligatoryData({
          companyUuid,
          careers: [{ careerCode }]
        });
        await expect(OfferRepository.create(attributes)).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await OfferCareer.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });

      it("throws an error if adding and existing career to one offer", async () => {
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        const { code } = firstCareer;
        const offerCareersData = [{ careerCode: code }, { careerCode: code }];
        const attributes = OfferGenerator.data.withObligatoryData({
          companyUuid,
          careers: offerCareersData
        });
        await expect(OfferRepository.create(attributes)).rejects.toThrowErrorWithMessage(
          UniqueConstraintError,
          "Validation error"
        );
      });

      it("throws an error if two sections have the same display order", async () => {
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        const attributes = OfferGenerator.data.withObligatoryData({
          companyUuid,
          sections: [sectionData]
        });
        const { uuid: offerUuid } = await OfferRepository.create(attributes);
        await expect(
          OfferSection.create({ offerUuid, ...sectionData })
        ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
      });
    });
  });

  describe("Update", () => {
    let company: Company;

    beforeAll(async () => {
      company = await CompanyGenerator.instance.withMinimumData();
    });

    const expectToUpdateTargetApplicantTypeTo = async (targetApplicantType: ApplicantType) => {
      const { uuid: companyUuid } = company;
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const offer = await OfferRepository.create(attributes);
      offer.set({ targetApplicantType });
      const updatedOffer = await OfferRepository.update({
        offer,
        careers: [],
        sections: []
      });
      expect(updatedOffer.targetApplicantType).toEqual(targetApplicantType);
    };

    const expectToUpdateAttribute = async (attributeName: string, value: string | number) => {
      const { uuid: companyUuid } = company;
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const offer = await OfferRepository.create(attributes);
      const { sections, careers, ...offerAttributes } = attributes;
      offer.set({ [attributeName]: value });
      await OfferRepository.update({ sections, careers, offer });
      const updatedOffer = await OfferRepository.findByUuid(offer.uuid);
      expect(updatedOffer).toBeObjectContaining({
        ...offerAttributes,
        [attributeName]: value
      });
    };

    it("updates title", async () => {
      await expectToUpdateAttribute("title", "newTitle");
    });

    it("updates description", async () => {
      await expectToUpdateAttribute("description", "newDescription");
    });

    it("updates minimumSalary", async () => {
      await expectToUpdateAttribute("minimumSalary", 1);
    });

    it("updates maximumSalary", async () => {
      await expectToUpdateAttribute("maximumSalary", 10000);
    });

    it("updates sections", async () => {
      const attributes = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid,
        sections: [{ title: "title", text: "text", displayOrder: 1 }]
      });
      const offer = await OfferRepository.create(attributes);
      const [section] = await offer.getSections();
      const newSectionData = {
        uuid: section.uuid,
        title: "newTitle",
        text: "newText",
        displayOrder: 1
      };
      await OfferRepository.update({ careers: [], sections: [newSectionData], offer });
      const [updatedSection] = await offer.getSections();
      expect(updatedSection).toBeObjectContaining({ uuid: section.uuid, ...newSectionData });
    });

    it("does not update if two sections have the same displayOrder", async () => {
      const { uuid: companyUuid } = company;
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const offer = await OfferRepository.create(attributes);

      expect(await offer.getSections()).toHaveLength(0);
      await expect(
        OfferRepository.update({
          offer,
          careers: [],
          sections: [
            { title: "title", text: "text", displayOrder: 1 },
            { title: "title", text: "text", displayOrder: 1 }
          ]
        })
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
      expect(await offer.getSections()).toHaveLength(0);
    });

    it("updates offer careers", async () => {
      const attributes = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid,
        careers: [{ careerCode: firstCareer.code }]
      });
      const offer = await OfferRepository.create(attributes);
      const [initialCareer] = await offer.getCareers();
      expect(initialCareer.code).toEqual(firstCareer.code);
      await OfferRepository.update({
        sections: [],
        careers: [{ careerCode: secondCareer.code }],
        offer
      });
      const [finalCareer] = await offer.getCareers();
      expect(finalCareer.code).toEqual(secondCareer.code);
    });

    it("it does not update if the career does not exist", async () => {
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
      const offer = await OfferRepository.create(attributes);
      await expect(
        OfferRepository.update({ sections: [], careers: [{ careerCode: "unknownCode" }], offer })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "OffersCareers" violates foreign key ' +
          'constraint "OffersCareers_careerCode_fkey"'
      );
    });

    it("updates targetApplicantType to student", async () => {
      await expectToUpdateTargetApplicantTypeTo(ApplicantType.student);
    });

    it("updates targetApplicantType to graduate", async () => {
      await expectToUpdateTargetApplicantTypeTo(ApplicantType.graduate);
    });

    it("updates targetApplicantType to both graduate and student", async () => {
      await expectToUpdateTargetApplicantTypeTo(ApplicantType.both);
    });

    it("throws an error if the offer does not belong to a company", async () => {
      const offer = new Offer();
      await expect(
        OfferRepository.update({ offer, sections: [], careers: [] })
      ).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: Offer.companyUuid cannot be null"
      );
    });
  });

  describe("findByUuid", () => {
    it("finds the only offer by uuid", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offerProps = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid: offerUuid } = await OfferRepository.create(offerProps);
      const offer = await OfferRepository.findByUuid(offerUuid);
      const { careers, sections, ...offerAttributes } = offerProps;
      expect(offer).toBeObjectContaining(offerAttributes);
    });

    it("throws an error if offer does not exist", async () => {
      await expect(
        OfferRepository.findByUuid("4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da")
      ).rejects.toThrow(OfferNotFoundError);
    });
  });

  describe("findAll", () => {
    let company: Company;
    let companyUuid: string;
    let offers: IForAllTargetsAndStatuses;
    let allOffers: Offer[];

    beforeAll(async () => {
      await OfferRepository.truncate();

      company = await CompanyGenerator.instance.withMinimumData();
      companyUuid = company.uuid;
      offers = await OfferGenerator.instance.forAllTargetsAndStatuses({ companyUuid });
      allOffers = [
        offers[ApplicantType.student][ApprovalStatus.pending],
        offers[ApplicantType.student][ApprovalStatus.approved],
        offers[ApplicantType.student][ApprovalStatus.rejected],
        offers[ApplicantType.graduate][ApprovalStatus.pending],
        offers[ApplicantType.graduate][ApprovalStatus.approved],
        offers[ApplicantType.graduate][ApprovalStatus.rejected],
        offers[ApplicantType.both][ApprovalStatus.pending],
        offers[ApplicantType.both][ApprovalStatus.approved],
        offers[ApplicantType.both][ApprovalStatus.rejected]
      ];
      allOffers = allOffers.sort(offer => -offer.updatedAt);
    });

    it("finds offers by companyUuid", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({ companyUuid });
      const uuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual(allOffers.map(({ uuid }) => uuid));
    });

    it("finds offers by title", async () => {
      const offer = offers[ApplicantType.both][ApprovalStatus.pending];
      const { results, shouldFetchMore } = await OfferRepository.findAll({ title: offer.title });
      const uuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual([offer.uuid]);
    });

    it("returns no offer if the given title does not belong to any offer", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({
        companyUuid,
        title: "UNKNOWN TITLE"
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });

    it("finds only the approved offers targeted for graduates", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({
        companyUuid,
        applicantType: ApplicantType.graduate
      });
      const uuids = results.map(({ uuid }) => uuid);
      const offerForGraduate = offers[ApplicantType.graduate][ApprovalStatus.approved];
      const offerForBoth = offers[ApplicantType.both][ApprovalStatus.approved];

      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual(expect.arrayContaining([offerForGraduate.uuid, offerForBoth.uuid]));
    });

    it("finds only the approved offers for any target", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({
        companyUuid,
        approvalStatus: ApprovalStatus.approved
      });
      const uuids = results.map(({ uuid }) => uuid);
      const offerForGraduate = offers[ApplicantType.graduate][ApprovalStatus.approved];
      const offerForBoth = offers[ApplicantType.both][ApprovalStatus.approved];
      const offerForStudents = offers[ApplicantType.student][ApprovalStatus.approved];

      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual(
        expect.arrayContaining([offerForStudents.uuid, offerForGraduate.uuid, offerForBoth.uuid])
      );
    });

    it("finds only the rejected offers for any target", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({
        companyUuid,
        approvalStatus: ApprovalStatus.rejected
      });
      const uuids = results.map(({ uuid }) => uuid);
      const offerForGraduate = offers[ApplicantType.graduate][ApprovalStatus.rejected];
      const offerForBoth = offers[ApplicantType.both][ApprovalStatus.rejected];
      const offerForStudents = offers[ApplicantType.student][ApprovalStatus.rejected];

      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual(
        expect.arrayContaining([offerForStudents.uuid, offerForGraduate.uuid, offerForBoth.uuid])
      );
    });

    it("finds only the pending offers for any target", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({
        companyUuid,
        approvalStatus: ApprovalStatus.pending
      });
      const uuids = results.map(({ uuid }) => uuid);
      const offerForGraduate = offers[ApplicantType.graduate][ApprovalStatus.pending];
      const offerForBoth = offers[ApplicantType.both][ApprovalStatus.pending];
      const offerForStudents = offers[ApplicantType.student][ApprovalStatus.pending];

      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual(
        expect.arrayContaining([offerForStudents.uuid, offerForGraduate.uuid, offerForBoth.uuid])
      );
    });

    it("finds only the offers by the company business sector", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({
        companyUuid,
        businessSector: company.businessSector
      });
      const uuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual(expect.arrayContaining(allOffers.map(({ uuid }) => uuid)));
    });

    it("returns no offer if the given businessSector does not belong to any company", async () => {
      const { results, shouldFetchMore } = await OfferRepository.findAll({
        companyUuid,
        businessSector: "UNKNOWN BUSINESS NAME"
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });

    it("finds offers specific to a career", async () => {
      const generator = OfferGenerator.instance.withObligatoryData;
      const offer = await generator({ careers: [{ careerCode: firstCareer.code }], companyUuid });
      await generator({ careers: [{ careerCode: secondCareer.code }], companyUuid });
      const { shouldFetchMore, results } = await OfferRepository.findAll({
        companyUuid,
        careerCodes: [firstCareer.code]
      });
      const uuids = results.map(({ uuid }) => uuid);

      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual([offer.uuid]);
    });

    it("returns nothing when careerCodes is empty", async () => {
      const generator = OfferGenerator.instance.withObligatoryData;
      await generator({ careers: [{ careerCode: firstCareer.code }], companyUuid });
      await generator({ careers: [{ careerCode: secondCareer.code }], companyUuid });
      const { shouldFetchMore, results } = await OfferRepository.findAll({
        companyUuid,
        careerCodes: []
      });
      const uuids = results.map(({ uuid }) => uuid);

      expect(shouldFetchMore).toBe(false);
      expect(uuids).toEqual([]);
    });

    it("fetches offers that match at least one career", async () => {
      const generator = OfferGenerator.instance.withObligatoryData;
      const firstOffer = await generator({
        careers: [{ careerCode: thirdCareer.code }],
        companyUuid
      });
      const secondOffer = await generator({
        careers: [{ careerCode: thirdCareer.code }, { careerCode: fourthCareer.code }],
        companyUuid
      });
      await generator({ companyUuid });
      const { results } = await OfferRepository.findAll({
        companyUuid,
        careerCodes: [thirdCareer.code, fourthCareer.code]
      });
      const uuids = results.map(({ uuid }) => uuid);

      expect(uuids).toEqual([secondOffer.uuid, firstOffer.uuid]);
    });
  });

  describe("Delete", () => {
    it("deletes all offers if all companies are deleted", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferRepository.create(
        OfferGenerator.data.withObligatoryData({ companyUuid })
      );
      await CompanyRepository.truncate();
      await expect(OfferRepository.findByUuid(offer.uuid)).rejects.toThrow(OfferNotFoundError);
    });

    it("deletes all offersCareers if all offers are deleted", async () => {
      await OfferRepository.truncate();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = firstCareer;
      await OfferRepository.create(
        OfferGenerator.data.withObligatoryData({
          companyUuid,
          careers: [{ careerCode }]
        })
      );
      expect(await OfferCareer.findAll()).toHaveLength(1);
      await OfferRepository.truncate();
      expect(await OfferCareer.findAll()).toHaveLength(0);
    });

    it("deletes all offersCareers and offer if all companies are deleted", async () => {
      await CompanyRepository.truncate();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = firstCareer;
      await OfferRepository.create(
        OfferGenerator.data.withObligatoryData({
          companyUuid,
          careers: [{ careerCode }]
        })
      );

      expect(await OfferCareer.findAll()).toHaveLength(1);
      await CompanyRepository.truncate();
      expect(await OfferCareer.findAll()).toHaveLength(0);
    });

    describe("OfferSections", () => {
      it("deletes all sections if all offers are deleted", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        await OfferRepository.create(
          OfferGenerator.data.withObligatoryData({
            companyUuid,
            sections: [sectionData]
          })
        );

        expect(await OfferSection.findAll()).toHaveLength(1);
        await OfferRepository.truncate();
        expect(await OfferSection.findAll()).toHaveLength(0);
      });

      it("deletes all sections and offer if all companies are deleted", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        await OfferRepository.create(
          OfferGenerator.data.withObligatoryData({
            companyUuid,
            sections: [sectionData]
          })
        );

        expect(await OfferSection.findAll()).toHaveLength(1);
        await OfferRepository.truncate();
        expect(await OfferSection.findAll()).toHaveLength(0);
      });
    });
  });

  describe("Find all", () => {
    let allOffersByDescUpdatedAt: Offer[] = [];

    beforeAll(async () => {
      OfferRepository.truncate();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      for (const milliseconds of range(8)) {
        MockDate.set(milliseconds);
        allOffersByDescUpdatedAt.push(
          await OfferRepository.create(OfferGenerator.data.withObligatoryData({ companyUuid }))
        );
        MockDate.reset();
      }
      allOffersByDescUpdatedAt = allOffersByDescUpdatedAt.sort(offer => -offer.updatedAt);
    });

    it("sorts by updatedAt DESC, limits to itemsPerPage results", async () => {
      const itemsPerPage = 5;
      mockItemsPerPage(itemsPerPage);
      const result = await OfferRepository.findAll({});
      expect(result.shouldFetchMore).toEqual(true);
      expect(result.results.map(offer => offer.uuid)).toEqual(
        allOffersByDescUpdatedAt.map(offer => offer.uuid).slice(0, itemsPerPage)
      );
    });

    it("gives last results, indicates that there are no earlier offers to fetch", async () => {
      mockItemsPerPage(3);
      const lastOfferIndex = 5;
      const lastOffer = allOffersByDescUpdatedAt[lastOfferIndex];
      const result = await OfferRepository.findAll({
        updatedBeforeThan: {
          dateTime: lastOffer.updatedAt,
          uuid: lastOffer.uuid
        }
      });
      expect(result.shouldFetchMore).toEqual(false);
      expect(result.results.map(offer => offer.uuid)).toEqual(
        allOffersByDescUpdatedAt
          .map(offer => offer.uuid)
          .slice(lastOfferIndex + 1, allOffersByDescUpdatedAt.length)
      );
    });

    it("returns all graduate offers including those that are going to expire today", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { uuid } = await OfferGenerator.instance.forGraduates({
        status: ApprovalStatus.approved,
        companyUuid
      });

      const offerAttributes = {
        graduatesExpirationDateTime: moment().endOf("day")
      };

      const [, [updatedOffer]] = await Offer.update(offerAttributes, {
        where: { uuid },
        returning: true
      });

      const itemsPerPage = 5;
      mockItemsPerPage(itemsPerPage);
      const result = await OfferRepository.findAll({ applicantType: ApplicantType.graduate });
      expect(result.results.map(offer => offer.uuid).includes(updatedOffer.uuid)).toBe(true);
    });

    it("won't return expired offers", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offerForGraduates = await OfferGenerator.instance.forGraduates({
        status: ApprovalStatus.approved,
        companyUuid
      });

      offerForGraduates.expire();
      await OfferRepository.save(offerForGraduates);

      const itemsPerPage = 5;
      mockItemsPerPage(itemsPerPage);
      const result = await OfferRepository.findAll({ applicantType: ApplicantType.graduate });
      expect(result.results.map(offer => offer.uuid).includes(offerForGraduates.uuid)).toBe(false);
    });

    describe("when there are offers with equal updatedAt", () => {
      const offers: Offer[] = [];

      beforeAll(async () => {
        MockDate.set(new Date());
        OfferRepository.truncate();
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        for (const _ of range(10)) {
          offers.push(
            await OfferRepository.create(OfferGenerator.data.withObligatoryData({ companyUuid }))
          );
        }
        MockDate.reset();
      });

      it("sorts by uuid", async () => {
        const result = await OfferRepository.findAll({});
        expect(result.shouldFetchMore).toEqual(false);
        expect(result.results.map(offer => offer.uuid)).toEqual(
          offers
            .map(offer => offer.uuid)
            .sort()
            .reverse()
        );
      });
    });
  });
});
