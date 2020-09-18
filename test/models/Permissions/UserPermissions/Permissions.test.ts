import { UserPermissions } from "$models/Permissions";
import { AdminRole, ApplicantRole, CompanyRole, CurrentUser } from "$models/CurrentUser";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { Secretary } from "$models/Admin";
import { Company, Admin, Applicant } from "$models";

import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { UserGenerator } from "$generators/User";
import { CareerGenerator } from "$generators/Career";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";

describe("UserPermissions", () => {
  let companyUuid: string;
  let company: Company;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    company = await CompanyGenerator.instance.withMinimumData();
    companyUuid = company.uuid;
  });

  describe("canSeeOffer", () => {
    describe("when the current user is an applicant", () => {
      it("returns true if the offer is for students and the applicant is a student", async () => {
        const offer = await OfferGenerator.instance.forStudents({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.student();
        const currentUser = new CurrentUser(userUuid, "email@email.com", [new ApplicantRole(uuid)]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns true if the offer is for students and the applicant is both", async () => {
        const offer = await OfferGenerator.instance.forStudents({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.studentAndGraduate();
        const currentUser = new CurrentUser(userUuid, "email@email.com", [new ApplicantRole(uuid)]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns true if the offer is for graduates and the applicant is a graduate", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.graduate();
        const currentUser = new CurrentUser(userUuid, "email@email.com", [new ApplicantRole(uuid)]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns true if the offer is for both and the applicant is both", async () => {
        const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.studentAndGraduate();
        const currentUser = new CurrentUser(userUuid, "email@email.com", [new ApplicantRole(uuid)]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns false if the offer is for students and the applicant is a graduate", async () => {
        const offer = await OfferGenerator.instance.forStudents({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.graduate();
        const currentUser = new CurrentUser(userUuid, "email@email.com", [new ApplicantRole(uuid)]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(false);
      });

      it("returns false if the offer is for graduates and the applicant is a student", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.student();
        const currentUser = new CurrentUser(userUuid, "email@email.com", [new ApplicantRole(uuid)]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(false);
      });
    });

    describe("when the current user is from a company", () => {
      it("returns true if the offer belongs to the company", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const [user] = await company.getUsers();
        const currentUser = new CurrentUser(user.uuid, "email@email.com", [
          new CompanyRole(companyUuid)
        ]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns false if the offer does not belongs to the company", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const anotherCompany = await CompanyGenerator.instance.withCompleteData();
        const [user] = await anotherCompany.getUsers();
        const currentUser = new CurrentUser(user.uuid, "email@email.com", [
          new CompanyRole(anotherCompany.uuid)
        ]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(false);
      });
    });

    describe("when the current user is and admin", () => {
      it("returns true for any offer from any company", async () => {
        const { uuid } = await CompanyGenerator.instance.withCompleteData();
        const firstOffer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const secondOffer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const thirdOffer = await OfferGenerator.instance.forGraduates({ companyUuid: uuid });
        const fourthOffer = await OfferGenerator.instance.forGraduates({ companyUuid: uuid });
        const { userUuid } = await AdminGenerator.instance({ secretary: Secretary.graduados });
        const currentUser = new CurrentUser(userUuid, "admin@email.com", [new AdminRole(userUuid)]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(firstOffer)).toBe(true);
        expect(await permissions.canSeeOffer(secondOffer)).toBe(true);
        expect(await permissions.canSeeOffer(thirdOffer)).toBe(true);
        expect(await permissions.canSeeOffer(fourthOffer)).toBe(true);
      });
    });

    describe("when the current user is and admin and an applicant", () => {
      it("returns true for any offer from any company", async () => {
        const { uuid } = await CompanyGenerator.instance.withCompleteData();
        const firstOffer = await OfferGenerator.instance.forStudents({ companyUuid });
        const thirdOffer = await OfferGenerator.instance.forStudents({ companyUuid: uuid });

        const { code: careerCode } = await CareerGenerator.instance();
        const user = await UserGenerator.instance();
        const applicant = await Applicant.create({ userUuid: user.uuid, padron: 98533 });
        await ApplicantCareersRepository.bulkCreate([{ careerCode, isGraduate: true }], applicant);
        const admin = await Admin.create({ userUuid: user.uuid, secretary: Secretary.extension });

        const currentUser = new CurrentUser(user.uuid, "admin@email.com", [
          new AdminRole(admin.userUuid),
          new ApplicantRole(applicant.uuid)
        ]);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(firstOffer)).toBe(true);
        expect(await permissions.canSeeOffer(thirdOffer)).toBe(true);
      });
    });
  });
});
