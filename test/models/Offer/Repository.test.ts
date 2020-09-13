import { UniqueConstraintError, ValidationError } from "sequelize";
import { CareerRepository } from "$models/Career";
import { ApplicantType, OfferRepository } from "$models/Offer";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { OfferApprovalEventRepository } from "$models/Offer/OfferApprovalEvent";
import { OfferNotFound, OfferNotUpdatedError } from "$models/Offer/Errors";
import { Admin, Offer, OfferCareer, OfferSection } from "$models";
import { isApprovalStatus } from "$models/SequelizeModelValidators";

import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { CareerGenerator } from "$generators/Career";
import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { omit, range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import MockDate from "mockdate";

describe("OfferRepository", () => {
  let graduadosAdmin: Admin;
  let extensionAdmin: Admin;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await OfferRepository.truncate();
    graduadosAdmin = await AdminGenerator.instance({ secretary: Secretary.graduados });
    extensionAdmin = await AdminGenerator.instance({ secretary: Secretary.extension });
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
    expect(offer).toBeObjectContaining(offerProps);
  };

  describe("Create", () => {
    it("creates a new offer", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offerProps = OfferGenerator.data.withObligatoryData({ companyUuid });
      const offer = await OfferRepository.create(offerProps);
      expect(offer).toBeObjectContaining(offerProps);
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
      const offer = await OfferRepository.create({
        ...attributes,
        sections: [sectionData]
      });
      expect(offer).toBeObjectContaining(attributes);
      const sections = await offer.getSections();
      expect(sections).toEqual([expect.objectContaining(sectionData)]);
    });

    it("creates a new offer with one career", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = await CareerGenerator.instance();
      const attributes = OfferGenerator.data.withObligatoryData({
        companyUuid,
        careers: [{ careerCode }]
      });
      const offer = await OfferRepository.create(attributes);
      expect(offer).toBeObjectContaining(omit(attributes, ["careers"]));
      const careers = await offer.getCareers();
      expect(careers).toEqual([
        expect.objectContaining({ code: attributes.careers![0].careerCode })
      ]);
    });

    it("creates a new offer with one career and one section", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = await CareerGenerator.instance();
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
        const { code } = await CareerGenerator.instance();
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

    describe("applicantCanApply", () => {
      let admin: Admin;

      beforeAll(async () => {
        admin = await AdminGenerator.instance({ secretary: Secretary.extension });
      });

      const createOfferFor = async (targetApplicantType: ApplicantType, status: ApprovalStatus) => {
        const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
        const { uuid } = await OfferRepository.create(
          OfferGenerator.data.withObligatoryData({
            companyUuid,
            targetApplicantType
          })
        );
        return await OfferRepository.updateApprovalStatus({ uuid, status, admin });
      };

      it("returns true if the offer is for students and the applicant is a student", async () => {
        const offer = await createOfferFor(ApplicantType.student, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.student();
        expect(await offer.applicantCanApply(applicant)).toBe(true);
      });

      it("returns true if the offer is for graduates and the applicant is a graduate", async () => {
        const offer = await createOfferFor(ApplicantType.graduate, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.graduate();
        expect(await offer.applicantCanApply(applicant)).toBe(true);
      });

      it("returns true if the offer is for both graduates and students and the applicant is both", async () => {
        const offer = await createOfferFor(ApplicantType.both, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.studentAndGraduate();
        expect(await offer.applicantCanApply(applicant)).toBe(true);
      });

      it("returns false if the offer is for students and the applicant is a graduate", async () => {
        const offer = await createOfferFor(ApplicantType.student, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.graduate();
        expect(await offer.applicantCanApply(applicant)).toBe(false);
      });

      it("returns false if the offer is for graduates and the applicant is a student", async () => {
        const offer = await createOfferFor(ApplicantType.graduate, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.student();
        expect(await offer.applicantCanApply(applicant)).toBe(false);
      });

      it("returns true if the offer is for both graduates and students and the applicant is a student", async () => {
        const offer = await createOfferFor(ApplicantType.both, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.student();
        expect(await offer.applicantCanApply(applicant)).toBe(true);
      });

      it("returns true if the offer is for both graduates and students and the applicant is a graduate", async () => {
        const offer = await createOfferFor(ApplicantType.both, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.graduate();
        expect(await offer.applicantCanApply(applicant)).toBe(true);
      });

      it("returns true if the offer is for students and the applicant is both", async () => {
        const offer = await createOfferFor(ApplicantType.student, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.studentAndGraduate();
        expect(await offer.applicantCanApply(applicant)).toBe(true);
      });

      it("returns true if the offer is for graduates and the applicant is both", async () => {
        const offer = await createOfferFor(ApplicantType.graduate, ApprovalStatus.approved);
        const applicant = await ApplicantGenerator.instance.studentAndGraduate();
        expect(await offer.applicantCanApply(applicant)).toBe(true);
      });
    });
  });

  describe("Update", () => {
    const expectToUpdateTargetApplicantTypeTo = async (targetApplicantType: ApplicantType) => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid } = await OfferRepository.create(attributes);
      const updatedOffer = await OfferRepository.update({
        uuid,
        ...attributes,
        targetApplicantType
      });
      expect(updatedOffer.targetApplicantType).toEqual(targetApplicantType);
    };

    it("updates successfully", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid } = await OfferRepository.create(attributes);
      const newSalary = attributes.maximumSalary + 100;
      const newAttributes = {
        ...attributes,
        minimumSalary: newSalary,
        maximumSalary: 2 * newSalary
      };
      await OfferRepository.update({ ...newAttributes, uuid });
      expect((await OfferRepository.findByUuid(uuid)).minimumSalary).toEqual(newSalary);
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

    it("moves both approval statuses back to pending", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid } = await OfferRepository.create(attributes);
      await OfferRepository.updateApprovalStatus({
        uuid,
        admin: extensionAdmin,
        status: ApprovalStatus.approved
      });
      await OfferRepository.updateApprovalStatus({
        uuid,
        admin: graduadosAdmin,
        status: ApprovalStatus.approved
      });
      await OfferRepository.update({ ...attributes, uuid });
      expect((await OfferRepository.findByUuid(uuid)).extensionApprovalStatus).toEqual(
        ApprovalStatus.pending
      );
      expect((await OfferRepository.findByUuid(uuid)).graduadosApprovalStatus).toEqual(
        ApprovalStatus.pending
      );
    });

    it("throws an error if the offer does not exist", async () => {
      const companyUuid = "bda5f82a-d839-4af3-ae04-1b669d590a85";
      const unknownOfferUuid = "1dd69a27-0f6c-4859-be9e-4de5adf22826";
      await expect(
        OfferRepository.update({
          ...OfferGenerator.data.withObligatoryData({ companyUuid }),
          uuid: unknownOfferUuid
        })
      ).rejects.toThrow(OfferNotUpdatedError);
    });
  });

  describe("UpdateApprovalStatus", () => {
    it("updates the status for the secretary graduados successfully", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid } = await OfferRepository.create(attributes);
      const newStatus = ApprovalStatus.approved;
      const params = {
        uuid,
        admin: graduadosAdmin,
        status: newStatus
      };
      await OfferRepository.updateApprovalStatus(params);

      expect((await OfferRepository.findByUuid(uuid)).graduadosApprovalStatus).toEqual(newStatus);
    });

    it("updates the status for the secretary extension successfully", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid } = await OfferRepository.create(attributes);
      const newStatus = ApprovalStatus.approved;
      const params = {
        uuid,
        admin: extensionAdmin,
        status: newStatus
      };
      await OfferRepository.updateApprovalStatus(params);

      expect((await OfferRepository.findByUuid(uuid)).extensionApprovalStatus).toEqual(newStatus);
    });

    it("creates an entry on OfferApprovalEvents table", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid } = await OfferRepository.create(attributes);
      const newStatus = ApprovalStatus.approved;
      const params = {
        uuid,
        admin: extensionAdmin,
        status: newStatus
      };
      await OfferRepository.updateApprovalStatus(params);
      const offerApprovalEvents = await OfferApprovalEventRepository.findAll();

      expect(offerApprovalEvents[offerApprovalEvents.length - 1].offerUuid).toEqual(uuid);
    });

    it("throws an error if the offer does not exist", async () => {
      const unknownOfferUuid = "1dd69a27-0f6c-4859-be9e-4de5adf22826";
      const newStatus = ApprovalStatus.approved;
      const params = {
        uuid: unknownOfferUuid,
        admin: graduadosAdmin,
        status: newStatus
      };

      await expect(OfferRepository.updateApprovalStatus(params)).rejects.toThrow(
        OfferNotUpdatedError
      );
    });

    it("throws an error if the status is not a valid ApprovalStatus value", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid } = await OfferRepository.create(attributes);
      const newStatus = "pepito" as ApprovalStatus;
      const params = {
        uuid,
        admin: extensionAdmin,
        status: newStatus
      };

      await expect(OfferRepository.updateApprovalStatus(params)).rejects.toThrowErrorWithMessage(
        ValidationError,
        isApprovalStatus.validate.isIn.msg
      );
    });
  });

  describe("Get", () => {
    it("finds the only offer by uuid", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offerProps = OfferGenerator.data.withObligatoryData({ companyUuid });
      const { uuid: offerUuid } = await OfferRepository.create(offerProps);
      const offer = await OfferRepository.findByUuid(offerUuid);
      expect(offer).toBeObjectContaining(offerProps);
    });

    it("finds the only offer by companyUuid", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offerProps = OfferGenerator.data.withObligatoryData({ companyUuid });
      await OfferRepository.create(offerProps);
      const {
        results: [offer]
      } = await OfferRepository.findAll({ companyUuid });
      expect(offer).toBeObjectContaining(offerProps);
    });

    it("finds only the approved offers targeted for graduates", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      await OfferGenerator.instance.updatedWithStatus({
        companyUuid,
        status: ApprovalStatus.approved,
        admin: await AdminGenerator.instance({ secretary: Secretary.graduados }),
        targetApplicantType: ApplicantType.graduate
      });
      await OfferGenerator.instance.updatedWithStatus({
        companyUuid,
        status: ApprovalStatus.approved,
        admin: await AdminGenerator.instance({ secretary: Secretary.extension }),
        targetApplicantType: ApplicantType.student
      });
      await OfferGenerator.instance.updatedWithStatus({
        companyUuid,
        status: ApprovalStatus.rejected,
        admin: await AdminGenerator.instance({ secretary: Secretary.extension }),
        targetApplicantType: ApplicantType.student
      });
      const { results } = await OfferRepository.findAll({
        companyUuid,
        applicantType: ApplicantType.graduate
      });
      expect(results).toHaveLength(1);
    });

    it("finds offers specific to a career", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: code1 } = await CareerGenerator.instance();
      const { code: code2 } = await CareerGenerator.instance();
      const { uuid: offerUuid } = await OfferGenerator.instance.withObligatoryData({
        careers: [{ careerCode: code1 }],
        companyUuid
      });
      await OfferGenerator.instance.withObligatoryData({
        careers: [{ careerCode: code2 }],
        companyUuid
      });
      const { results } = await OfferRepository.findAll({
        companyUuid,
        careerCodes: [code1]
      });
      expect(results.map(result => result.uuid)).toEqual([offerUuid]);
    });

    it("returns nothing when careerCodes is empty", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: code1 } = await CareerGenerator.instance();
      const { code: code2 } = await CareerGenerator.instance();
      await OfferGenerator.instance.withObligatoryData({
        careers: [{ careerCode: code1 }],
        companyUuid
      });
      await OfferGenerator.instance.withObligatoryData({
        careers: [{ careerCode: code2 }],
        companyUuid
      });
      const { results } = await OfferRepository.findAll({
        companyUuid,
        careerCodes: []
      });
      expect(results).toEqual([]);
    });

    it("fetches offers that match at least one career", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: code1 } = await CareerGenerator.instance();
      const { code: code2 } = await CareerGenerator.instance();
      const { code: code3 } = await CareerGenerator.instance();
      const { uuid: offerUuid1 } = await OfferGenerator.instance.withObligatoryData({
        careers: [{ careerCode: code1 }],
        companyUuid
      });
      const { uuid: offerUuid2 } = await OfferGenerator.instance.withObligatoryData({
        careers: [{ careerCode: code2 }, { careerCode: code3 }],
        companyUuid
      });
      await OfferGenerator.instance.withObligatoryData({
        companyUuid
      });
      const { results } = await OfferRepository.findAll({
        companyUuid,
        careerCodes: [code1, code2]
      });
      expect(results.map(result => result.uuid)).toEqual([offerUuid2, offerUuid1]);
    });

    it("throws an error if offer does not exists", async () => {
      await expect(
        OfferRepository.findByUuid("4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da")
      ).rejects.toThrow(OfferNotFound);
    });
  });

  describe("Delete", () => {
    it("deletes all offers if all companies are deleted", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferRepository.create(
        OfferGenerator.data.withObligatoryData({ companyUuid })
      );
      await CompanyRepository.truncate();
      await expect(OfferRepository.findByUuid(offer.uuid)).rejects.toThrow(OfferNotFound);
    });

    it("deletes all offersCareers if all offers are deleted", async () => {
      await OfferRepository.truncate();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = await CareerGenerator.instance();
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
      await CareerRepository.truncate();
      await CompanyRepository.truncate();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { code: careerCode } = await CareerGenerator.instance();
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
